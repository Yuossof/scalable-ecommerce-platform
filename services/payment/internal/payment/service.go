package payment

import (
	"context"
	"errors"
	"fmt"
	"log"
)

// Service contains the payment business logic. It is transport-agnostic so the
// AMQP workers and unit tests can use it directly.
type Service struct {
	repo          Repository
	gateway       PaymentGateway
	notifications NotificationPublisher
}

func NewService(repo Repository, gateway PaymentGateway, notifications NotificationPublisher) *Service {
	return &Service{
		repo:          repo,
		gateway:       gateway,
		notifications: notifications,
	}
}

// CreatePaymentIntent creates the Stripe PaymentIntent for an order and stores
// the matching pending payment. If a pending payment already exists, the
// existing Stripe intent is reused, making RPC redeliveries safe.
func (s *Service) CreatePaymentIntent(ctx context.Context, request CreatePaymentRequest) (CreatePaymentResult, error) {
	if err := request.Validate(); err != nil {
		return CreatePaymentResult{}, &ServiceError{
			Code:    "invalid_request",
			Message: err.Error(),
			Err:     err,
		}
	}

	existing, err := s.repo.FindPendingPayment(ctx, request.OrderID)
	if err != nil {
		return CreatePaymentResult{}, &ServiceError{
			Code:    "internal_error",
			Message: "could not look up the order payment",
			Err:     err,
		}
	}
	if existing != nil {
		intent, err := s.gateway.GetPaymentIntent(ctx, existing.TransactionID)
		if err != nil {
			return CreatePaymentResult{}, &ServiceError{
				Code:    "payment_provider_error",
				Message: "could not retrieve the existing payment intent",
				Err:     err,
			}
		}
		if intent.ClientSecret == "" {
			return CreatePaymentResult{}, &ServiceError{
				Code:    "payment_provider_error",
				Message: "existing payment intent has no client secret",
			}
		}
		return CreatePaymentResult{Payment: *existing, ClientSecret: intent.ClientSecret}, nil
	}

	intent, err := s.gateway.CreatePaymentIntent(ctx, request.OrderID, request.UserID, ToMinorUnits(request.Amount))
	if err != nil {
		return CreatePaymentResult{}, &ServiceError{
			Code:    "payment_provider_error",
			Message: "could not create the payment intent",
			Err:     err,
		}
	}
	if intent.ID == "" || intent.ClientSecret == "" {
		return CreatePaymentResult{}, &ServiceError{
			Code:    "payment_provider_error",
			Message: "Stripe returned an incomplete payment intent",
		}
	}

	payment, err := s.repo.CreatePayment(ctx, NewPayment{
		OrderID:       request.OrderID,
		Provider:      "stripe",
		TransactionID: intent.ID,
		Amount:        request.Amount,
		Status:        StatusPending,
	})
	if err != nil {
		return CreatePaymentResult{}, &ServiceError{
			Code:    "internal_error",
			Message: "could not save the payment",
			Err:     err,
		}
	}

	return CreatePaymentResult{Payment: payment, ClientSecret: intent.ClientSecret}, nil
}

// HandlePaymentEvent applies a Stripe webhook event: it updates the payment
// and order state (and stock on success) and then publishes a best-effort
// customer notification. Notification failures never fail the payment itself.
func (s *Service) HandlePaymentEvent(ctx context.Context, event PaymentEvent) error {
	if err := event.Validate(); err != nil {
		return &ServiceError{Code: "invalid_message", Message: err.Error(), Err: err}
	}

	status, _ := NormalizeStatus(event.Status)
	orderID := event.PaymentIntent.Metadata.OrderID
	userID := event.PaymentIntent.Metadata.UserID

	changed, err := s.repo.ApplyPaymentStatus(ctx, status, orderID)
	if err != nil {
		return fmt.Errorf("apply payment status for order %s: %w", orderID, err)
	}
	if !changed {
		log.Printf("Payment event %s for order %s already processed (status=%s)", event.EventID, orderID, status)
		return nil
	}
	log.Printf("Payment for order %s updated to %s", orderID, status)

	message, ok := NotificationForStatus(status)
	if !ok {
		return nil
	}
	if userID == "" {
		log.Printf("Cannot notify customer for order %s: missing user_id in payment metadata", orderID)
		return nil
	}

	email, err := s.repo.FindUserEmail(ctx, userID)
	if err != nil {
		log.Printf("Cannot notify customer for order %s: %v", orderID, err)
		return nil
	}
	message.Email = email

	if err := s.notifications.Publish(ctx, message); err != nil {
		log.Printf("Failed to publish notification for order %s: %v", orderID, err)
		return nil
	}
	log.Printf("Notification for order %s published to the notification queue", orderID)
	return nil
}

// ErrorCode returns the stable code of a service error, if it has one.
func ErrorCode(err error) string {
	var serviceErr *ServiceError
	if errors.As(err, &serviceErr) {
		return serviceErr.Code
	}
	return "internal_error"
}

// ErrorMessage returns a customer-safe message for a service error.
func ErrorMessage(err error) string {
	var serviceErr *ServiceError
	if errors.As(err, &serviceErr) {
		return serviceErr.Message
	}
	return "payment service failed"
}
