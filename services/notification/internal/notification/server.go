package notification

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/rabbitmq/amqp091-go"
	"github.com/resend/resend-go/v4"
)

const QueueName = "notifications"

type NotificationEvent struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

type NotificationWorker struct {
	amqpCh *amqp091.Channel
	client *resend.Client
	msgs   <-chan amqp091.Delivery
}

func NewNotificationWorker(conn *amqp091.Connection, client *resend.Client) (*NotificationWorker, error) {
	amqpCh, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("open channel: %w", err)
	}

	q, err := amqpCh.QueueDeclare(
		QueueName, // queue name
		true,      // durable
		false,     // auto delete
		false,     // exclusive
		false,     // no wait
		nil,       // arguments
	)
	if err != nil {
		amqpCh.Close()
		return nil, fmt.Errorf("declare queue: %w", err)
	}

	if err := amqpCh.Qos(5, 0, false); err != nil {
		amqpCh.Close()
		return nil, fmt.Errorf("set QoS: %w", err)
	}

	msgs, err := amqpCh.Consume(
		q.Name,
		"",    // consumer tag
		false, // auto ACK
		false, // exclusive
		false, // no local
		false, // no wait
		nil,   // arguments
	)
	if err != nil {
		amqpCh.Close()
		return nil, fmt.Errorf("register consumer: %w", err)
	}

	return &NotificationWorker{
		client: client,
		amqpCh: amqpCh,
		msgs:   msgs,
	}, nil
}

func (n *NotificationWorker) StartWorker() {
	go func() {
		for msg := range n.msgs {
			var event NotificationEvent

			if err := json.Unmarshal(msg.Body, &event); err != nil {
				log.Printf("Invalid notification message: %v", err)
				// Malformed messages will never succeed, so drop them.
				if err := msg.Nack(false, false); err != nil {
					log.Printf("NACK failed: %v", err)
				}
				continue
			}

			if err := n.SendMail(event.Email, event.Subject, event.Body); err != nil {
				log.Printf("Failed to send email to %s: %v", event.Email, err)
				// Avoid a hot redelivery loop for messages that keep failing.
				if err := msg.Nack(false, false); err != nil {
					log.Printf("NACK failed: %v", err)
				}
				continue
			}

			log.Printf("Notification sent to %s", event.Email)
			if err := msg.Ack(false); err != nil {
				log.Printf("ACK failed: %v", err)
			}
		}
	}()
}

func (n *NotificationWorker) Close() error {
	return n.amqpCh.Close()
}

func (n *NotificationWorker) SendMail(email, subject, body string) error {
	params := &resend.SendEmailRequest{
		From:    "Acme <onboarding@resend.dev>",
		To:      []string{email},
		Html:    body,
		Subject: subject,
	}

	sent, err := n.client.Emails.Send(params)
	if err != nil {
		return err
	}

	log.Println("Email sent:", sent.Id)
	return nil
}
