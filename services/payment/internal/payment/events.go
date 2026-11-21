package payment

import (
	"errors"
	"fmt"
	"math"
	"strings"
)

// Payment statuses understood by the service. The Stripe webhook publisher
// sends "success", while older callers used "paid"; both are accepted and
// normalised to "success" before anything is written to the database.
const (
	StatusPending  = "pending"
	StatusSuccess  = "success"
	StatusFailed   = "failed"
	StatusCanceled = "canceled"
)

// ServiceError is an error with a stable code that can be sent back over the
// RabbitMQ RPC contract.
type ServiceError struct {
	Code    string
	Message string
	Err     error
}

func (e *ServiceError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *ServiceError) Unwrap() error { return e.Err }

// StripeIntent is the small subset of a Stripe PaymentIntent that the service
// needs to create a payment and to return a client secret to the API.
type StripeIntent struct {
	ID           string
	ClientSecret string
}

// PaymentIntentMetadata identifies the order and the customer for a payment.
type PaymentIntentMetadata struct {
	OrderID string `json:"order_id"`
	UserID  string `json:"user_id"`
}

// WebhookPaymentIntent is the subset of a Stripe PaymentIntent carried in a
// payment_queue message. Extra Stripe fields are ignored on purpose.
type WebhookPaymentIntent struct {
	ID       string                `json:"id"`
	Metadata PaymentIntentMetadata `json:"metadata"`
}

// PaymentEvent is the payload published by the API's Stripe webhook handler.
type PaymentEvent struct {
	PaymentIntent WebhookPaymentIntent `json:"paymentIntent"`
	Status        string               `json:"status"`
	EventID       string               `json:"event_id,omitempty"`
	EventType     string               `json:"event_type,omitempty"`
}

// Validate checks that a payment event can be processed.
func (e PaymentEvent) Validate() error {
	if strings.TrimSpace(e.PaymentIntent.Metadata.OrderID) == "" {
		return errors.New("payment event is missing paymentIntent.metadata.order_id")
	}
	if _, ok := NormalizeStatus(e.Status); !ok {
		return fmt.Errorf("unsupported payment status %q", e.Status)
	}
	return nil
}

// NormalizeStatus maps the status vocabulary of callers onto the canonical
// statuses stored in the database.
func NormalizeStatus(status string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case StatusSuccess, "paid", "succeeded":
		return StatusSuccess, true
	case StatusFailed:
		return StatusFailed, true
	case StatusCanceled, "cancelled":
		return StatusCanceled, true
	default:
		return "", false
	}
}

// CreatePaymentRequest is the RPC payload sent by the TypeScript API when an
// order has been created.
type CreatePaymentRequest struct {
	OrderID string  `json:"order_id"`
	UserID  string  `json:"user_id"`
	Amount  float64 `json:"amount"`
}

// Validate checks the fields of a create-payment request.
func (r CreatePaymentRequest) Validate() error {
	if strings.TrimSpace(r.OrderID) == "" {
		return errors.New("order_id is required")
	}
	if strings.TrimSpace(r.UserID) == "" {
		return errors.New("user_id is required")
	}
	if math.IsNaN(r.Amount) || math.IsInf(r.Amount, 0) || r.Amount <= 0 {
		return errors.New("amount must be a positive number")
	}
	if r.Amount > 99999999.99 {
		return errors.New("amount exceeds the maximum supported value")
	}
	return nil
}

// Payment is the persisted payment row.
type Payment struct {
	ID            string  `json:"id"`
	OrderID       string  `json:"order_id"`
	Provider      string  `json:"provider"`
	TransactionID string  `json:"transaction_id"`
	Amount        float64 `json:"amount"`
	Status        string  `json:"status"`
}

// NewPayment contains the values required to insert a pending payment.
type NewPayment struct {
	OrderID       string
	Provider      string
	TransactionID string
	Amount        float64
	Status        string
}

// CreatePaymentResult is returned to the API after a PaymentIntent is created.
type CreatePaymentResult struct {
	Payment      Payment `json:"payment"`
	ClientSecret string  `json:"client_secret"`
}

// RPCError is the error part of a create-payment RPC response.
type RPCError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// CreatePaymentResponse is the reply envelope of the create-payment RPC.
type CreatePaymentResponse struct {
	OK    bool                 `json:"ok"`
	Data  *CreatePaymentResult `json:"data,omitempty"`
	Error *RPCError            `json:"error,omitempty"`
}

// NotificationMessage matches the contract of the Go notification service.
type NotificationMessage struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

// NotificationForStatus builds the customer email for a processed status.
// Unknown statuses are deliberately not notified.
func NotificationForStatus(status string) (NotificationMessage, bool) {
	switch status {
	case StatusSuccess:
		return NotificationMessage{
			Subject: "Order Confirmed",
			Body:    "Your order has been confirmed",
		}, true
	case StatusFailed:
		return NotificationMessage{
			Subject: "Payment Failed",
			Body:    "Your payment could not be processed",
		}, true
	case StatusCanceled:
		return NotificationMessage{
			Subject: "Payment Canceled",
			Body:    "Your payment was canceled",
		}, true
	default:
		return NotificationMessage{}, false
	}
}

// ToMinorUnits converts a decimal amount to Stripe's smallest currency unit.
func ToMinorUnits(amount float64) int64 {
	return int64(math.Round(amount * 100))
}
