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

// CreatePaymentRPC serves the request/reply queue used by the API to create
// Stripe PaymentIntents through this service.
type CreatePaymentRPC struct {
	conn     *amqp.Connection
	service  *Service
	queue    string
	prefetch int
	timeout  time.Duration
}

func NewCreatePaymentRPC(
	conn *amqp.Connection,
	service *Service,
	queue string,
	prefetch int,
	timeout time.Duration,
) *CreatePaymentRPC {
	return &CreatePaymentRPC{
		conn:     conn,
		service:  service,
		queue:    queue,
		prefetch: prefetch,
		timeout:  timeout,
	}
}

// Run blocks until the context is cancelled or the consumer channel closes.
func (r *CreatePaymentRPC) Run(ctx context.Context) error {
	channel, err := r.conn.Channel()
	if err != nil {
		return fmt.Errorf("open payment RPC channel: %w", err)
	}
	defer func() { _ = channel.Close() }()

	queue, err := channel.QueueDeclare(r.queue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("declare payment RPC queue: %w", err)
	}
	if err := channel.Qos(r.prefetch, 0, false); err != nil {
		return fmt.Errorf("set payment RPC QoS: %w", err)
	}

	deliveries, err := channel.Consume(queue.Name, "", false, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("consume payment RPC queue: %w", err)
	}
	log.Printf("Create-payment RPC listening on queue %q", queue.Name)

	for {
		select {
		case <-ctx.Done():
			return nil
		case delivery, ok := <-deliveries:
			if !ok {
				return errors.New("payment RPC consumer channel closed")
			}
			r.process(ctx, channel, delivery)
		}
	}
}

func (r *CreatePaymentRPC) process(ctx context.Context, channel *amqp.Channel, delivery amqp.Delivery) {
	messageCtx, cancel := context.WithTimeout(ctx, r.timeout)
	defer cancel()

	response := r.handle(messageCtx, delivery.Body)

	if delivery.ReplyTo == "" || delivery.CorrelationId == "" {
		log.Printf("Payment RPC request %s has no reply address; dropping response", delivery.CorrelationId)
		if err := delivery.Ack(false); err != nil {
			log.Printf("Failed to ACK payment RPC request: %v", err)
		}
		return
	}

	body, err := json.Marshal(response)
	if err != nil {
		log.Printf("Failed to encode payment RPC response: %v", err)
		if err := delivery.Nack(false, true); err != nil {
			log.Printf("Failed to NACK payment RPC request: %v", err)
		}
		return
	}

	err = channel.PublishWithContext(messageCtx, "", delivery.ReplyTo, false, false, amqp.Publishing{
		ContentType:   "application/json",
		CorrelationId: delivery.CorrelationId,
		DeliveryMode:  amqp.Persistent,
		Body:          body,
	})
	if err != nil {
		log.Printf("Failed to reply to payment RPC request %s: %v", delivery.CorrelationId, err)
		if err := delivery.Nack(false, true); err != nil {
			log.Printf("Failed to NACK payment RPC request: %v", err)
		}
		return
	}

	if err := delivery.Ack(false); err != nil {
		log.Printf("Failed to ACK payment RPC request %s: %v", delivery.CorrelationId, err)
	}
}

func (r *CreatePaymentRPC) handle(ctx context.Context, body []byte) CreatePaymentResponse {
	var request CreatePaymentRequest
	if err := json.Unmarshal(body, &request); err != nil {
		return errorResponse("invalid_request", fmt.Sprintf("invalid payment request: %v", err))
	}

	result, err := r.service.CreatePaymentIntent(ctx, request)
	if err != nil {
		return errorResponse(ErrorCode(err), ErrorMessage(err))
	}
	return CreatePaymentResponse{OK: true, Data: &result}
}

func errorResponse(code, message string) CreatePaymentResponse {
	return CreatePaymentResponse{
		OK:    false,
		Error: &RPCError{Code: code, Message: message},
	}
}
