package payment

import (
	"context"
	"errors"
	"testing"
)

type fakeRepository struct {
	existing       *Payment
	created        *NewPayment
	appliedStatus  string
	appliedOrderID string
	changed        bool
	email          string
	createErr      error
	findErr        error
	applyErr       error
	emailErr       error
}

func (f *fakeRepository) CreatePayment(_ context.Context, input NewPayment) (Payment, error) {
	if f.createErr != nil {
		return Payment{}, f.createErr
	}
	f.created = &input
	return Payment{
		ID:            "pay-1",
		OrderID:       input.OrderID,
		Provider:      input.Provider,
		TransactionID: input.TransactionID,
		Amount:        input.Amount,
		Status:        input.Status,
	}, nil
}

func (f *fakeRepository) FindPendingPayment(_ context.Context, _ string) (*Payment, error) {
	return f.existing, f.findErr
}

func (f *fakeRepository) FindUserEmail(_ context.Context, _ string) (string, error) {
	return f.email, f.emailErr
}

func (f *fakeRepository) ApplyPaymentStatus(_ context.Context, status, orderID string) (bool, error) {
	f.appliedStatus = status
	f.appliedOrderID = orderID
	return f.changed, f.applyErr
}

type fakeGateway struct {
	intent         StripeIntent
	createdOrderID string
	createdUserID  string
	createdAmount  int64
	createCalls    int
	retrievedID    string
	err            error
}

func (f *fakeGateway) CreatePaymentIntent(_ context.Context, orderID, userID string, amount int64) (StripeIntent, error) {
	f.createCalls++
	f.createdOrderID = orderID
	f.createdUserID = userID
	f.createdAmount = amount
	if f.err != nil {
		return StripeIntent{}, f.err
	}
	return f.intent, nil
}

func (f *fakeGateway) GetPaymentIntent(_ context.Context, transactionID string) (StripeIntent, error) {
	f.retrievedID = transactionID
	return f.intent, f.err
}

type fakePublisher struct {
	messages []NotificationMessage
	err      error
}

func (f *fakePublisher) Publish(_ context.Context, message NotificationMessage) error {
	if f.err != nil {
		return f.err
	}
	f.messages = append(f.messages, message)
	return nil
}

func successEvent() PaymentEvent {
	return PaymentEvent{
		EventID: "evt_1",
		PaymentIntent: WebhookPaymentIntent{
			ID: "pi_1",
			Metadata: PaymentIntentMetadata{
				OrderID: "order-1",
				UserID:  "user-1",
			},
		},
		Status: "success",
	}
}

func TestCreatePaymentIntent(t *testing.T) {
	repo := &fakeRepository{}
	gateway := &fakeGateway{intent: StripeIntent{ID: "pi_1", ClientSecret: "pi_1_secret"}}
	service := NewService(repo, gateway, &fakePublisher{})

	result, err := service.CreatePaymentIntent(context.Background(), CreatePaymentRequest{
		OrderID: "order-1",
		UserID:  "user-1",
		Amount:  12.34,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ClientSecret != "pi_1_secret" || result.Payment.TransactionID != "pi_1" {
		t.Fatalf("unexpected result: %+v", result)
	}
	if gateway.createdAmount != 1234 || gateway.createdOrderID != "order-1" || gateway.createdUserID != "user-1" {
		t.Fatalf("unexpected Stripe parameters: %+v", gateway)
	}
	if repo.created == nil || repo.created.Status != StatusPending || repo.created.Provider != "stripe" {
		t.Fatalf("pending payment was not stored: %+v", repo.created)
	}
}

func TestCreatePaymentIntentReusesPendingPayment(t *testing.T) {
	repo := &fakeRepository{
		existing: &Payment{ID: "pay-1", TransactionID: "pi_old", Status: StatusPending},
	}
	gateway := &fakeGateway{intent: StripeIntent{ID: "pi_old", ClientSecret: "pi_old_secret"}}
	service := NewService(repo, gateway, &fakePublisher{})

	result, err := service.CreatePaymentIntent(context.Background(), CreatePaymentRequest{
		OrderID: "order-1",
		UserID:  "user-1",
		Amount:  10,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gateway.createCalls != 0 || gateway.retrievedID != "pi_old" {
		t.Fatalf("expected the existing intent to be reused: %+v", gateway)
	}
	if repo.created != nil {
		t.Fatal("a duplicate payment row was created")
	}
	if result.ClientSecret != "pi_old_secret" {
		t.Fatalf("unexpected client secret: %q", result.ClientSecret)
	}
}

func TestCreatePaymentIntentRejectsInvalidAmount(t *testing.T) {
	service := NewService(&fakeRepository{}, &fakeGateway{}, &fakePublisher{})

	_, err := service.CreatePaymentIntent(context.Background(), CreatePaymentRequest{
		OrderID: "order-1",
		UserID:  "user-1",
		Amount:  0,
	})
	if err == nil || ErrorCode(err) != "invalid_request" {
		t.Fatalf("expected invalid_request error, got %v", err)
	}
}

func TestHandlePaymentEventSuccess(t *testing.T) {
	repo := &fakeRepository{changed: true, email: "user@example.com"}
	publisher := &fakePublisher{}
	service := NewService(repo, &fakeGateway{}, publisher)

	if err := service.HandlePaymentEvent(context.Background(), successEvent()); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.appliedStatus != StatusSuccess || repo.appliedOrderID != "order-1" {
		t.Fatalf("unexpected status update: %+v", repo)
	}
	if len(publisher.messages) != 1 {
		t.Fatalf("expected one notification, got %+v", publisher.messages)
	}
	message := publisher.messages[0]
	if message.Email != "user@example.com" || message.Subject != "Order Confirmed" ||
		message.Body != "Your order has been confirmed" {
		t.Fatalf("unexpected notification: %+v", message)
	}
}

func TestHandlePaymentEventAlreadyProcessed(t *testing.T) {
	repo := &fakeRepository{changed: false, email: "user@example.com"}
	publisher := &fakePublisher{}
	service := NewService(repo, &fakeGateway{}, publisher)

	if err := service.HandlePaymentEvent(context.Background(), successEvent()); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.appliedStatus != StatusSuccess {
		t.Fatal("status was not checked")
	}
	if len(publisher.messages) != 0 {
		t.Fatal("already processed events must not send another notification")
	}
}

func TestHandlePaymentEventFailureNotification(t *testing.T) {
	repo := &fakeRepository{changed: true, email: "user@example.com"}
	publisher := &fakePublisher{}
	service := NewService(repo, &fakeGateway{}, publisher)
	event := successEvent()
	event.Status = "failed"

	if err := service.HandlePaymentEvent(context.Background(), event); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.appliedStatus != StatusFailed || len(publisher.messages) != 1 {
		t.Fatalf("unexpected handling of failure: %+v, %+v", repo, publisher.messages)
	}
	if publisher.messages[0].Subject != "Payment Failed" {
		t.Fatalf("unexpected failure notification: %+v", publisher.messages[0])
	}
}

func TestHandlePaymentEventNotificationFailureIsNotFatal(t *testing.T) {
	repo := &fakeRepository{changed: true, email: "user@example.com"}
	publisher := &fakePublisher{err: errors.New("rabbitmq unavailable")}
	service := NewService(repo, &fakeGateway{}, publisher)

	if err := service.HandlePaymentEvent(context.Background(), successEvent()); err != nil {
		t.Fatalf("notification failure must not fail the payment: %v", err)
	}
}

func TestHandlePaymentEventMissingUserID(t *testing.T) {
	repo := &fakeRepository{changed: true, email: "user@example.com"}
	publisher := &fakePublisher{}
	service := NewService(repo, &fakeGateway{}, publisher)
	event := successEvent()
	event.PaymentIntent.Metadata.UserID = ""

	if err := service.HandlePaymentEvent(context.Background(), event); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(publisher.messages) != 0 {
		t.Fatal("an event without a user id cannot produce a notification")
	}
}

func TestHandlePaymentEventInvalidStatus(t *testing.T) {
	service := NewService(&fakeRepository{}, &fakeGateway{}, &fakePublisher{})
	event := successEvent()
	event.Status = "unknown"

	err := service.HandlePaymentEvent(context.Background(), event)
	if err == nil || ErrorCode(err) != "invalid_message" {
		t.Fatalf("expected invalid_message error, got %v", err)
	}
}
