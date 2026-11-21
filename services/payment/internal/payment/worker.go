package payment

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// EventWorker consumes Stripe webhook events from the payment queue.
type EventWorker struct {
	conn     *amqp.Connection
	service  *Service
	queue    string
	prefetch int
	timeout  time.Duration
}

func NewEventWorker(conn *amqp.Connection, service *Service, queue string, prefetch int, timeout time.Duration) *EventWorker {
	return &EventWorker{
		conn:     conn,
		service:  service,
		queue:    queue,
		prefetch: prefetch,
		timeout:  timeout,
	}
}

// Run blocks until the context is cancelled or the consumer channel closes.
func (w *EventWorker) Run(ctx context.Context) error {
	channel, err := w.conn.Channel()
	if err != nil {
		return fmt.Errorf("open event consumer channel: %w", err)
	}
	defer func() { _ = channel.Close() }()

	queue, err := channel.QueueDeclare(w.queue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("declare payment queue: %w", err)
	}
	if err := channel.Qos(w.prefetch, 0, false); err != nil {
		return fmt.Errorf("set payment consumer QoS: %w", err)
	}

	deliveries, err := channel.Consume(queue.Name, "", false, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("consume payment queue: %w", err)
	}
	log.Printf("Payment event worker listening on queue %q", queue.Name)

	for {
		select {
		case <-ctx.Done():
			return nil
		case delivery, ok := <-deliveries:
			if !ok {
				return errors.New("payment event consumer channel closed")
			}
			w.process(ctx, delivery)
		}
	}
}

func (w *EventWorker) process(ctx context.Context, delivery amqp.Delivery) {
	messageCtx, cancel := context.WithTimeout(ctx, w.timeout)
	defer cancel()

	var event PaymentEvent
	if err := json.Unmarshal(delivery.Body, &event); err != nil {
		log.Printf("Invalid payment event message: %v", err)
		w.nack(delivery)
		return
	}

	if err := w.service.HandlePaymentEvent(messageCtx, event); err != nil {
		log.Printf("Failed to process payment event %s: %v", event.EventID, err)
		w.nack(delivery)
		return
	}

	if err := delivery.Ack(false); err != nil {
		log.Printf("Failed to ACK payment event %s: %v", event.EventID, err)
	}
}

// Malformed messages and permanent failures are dropped instead of requeued so
// a poison message cannot block the queue in a hot redelivery loop.
func (w *EventWorker) nack(delivery amqp.Delivery) {
	if err := delivery.Nack(false, false); err != nil {
		log.Printf("Failed to NACK payment event: %v", err)
	}
}
