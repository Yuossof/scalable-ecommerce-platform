package payment

import (
	"context"
	"encoding/json"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
)

// NotificationPublisher sends customer emails through the notification queue.
type NotificationPublisher interface {
	Publish(ctx context.Context, message NotificationMessage) error
}

// AMQPNotificationPublisher publishes persistent messages to the durable
// "notifications" queue consumed by the Go notification service.
type AMQPNotificationPublisher struct {
	channel *amqp.Channel
	queue   string
}

func NewAMQPNotificationPublisher(channel *amqp.Channel, queue string) (*AMQPNotificationPublisher, error) {
	if _, err := channel.QueueDeclare(queue, true, false, false, false, nil); err != nil {
		return nil, fmt.Errorf("declare notifications queue: %w", err)
	}
	return &AMQPNotificationPublisher{channel: channel, queue: queue}, nil
}

func (p *AMQPNotificationPublisher) Publish(ctx context.Context, message NotificationMessage) error {
	body, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("encode notification message: %w", err)
	}

	return p.channel.PublishWithContext(ctx, "", p.queue, false, false, amqp.Publishing{
		ContentType:  "application/json",
		DeliveryMode: amqp.Persistent,
		Body:         body,
	})
}
