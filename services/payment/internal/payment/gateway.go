package payment

import (
	"context"
	"fmt"

	stripe "github.com/stripe/stripe-go/v82"
)

// PaymentGateway abstracts the Stripe calls used by the service.
type PaymentGateway interface {
	CreatePaymentIntent(ctx context.Context, orderID, userID string, amount int64) (StripeIntent, error)
	GetPaymentIntent(ctx context.Context, transactionID string) (StripeIntent, error)
}

// StripeGateway talks to the Stripe Payment Intents API.
type StripeGateway struct {
	client *stripe.Client
}

func NewStripeGateway(secretKey string) *StripeGateway {
	return &StripeGateway{client: stripe.NewClient(secretKey)}
}

func (g *StripeGateway) CreatePaymentIntent(
	ctx context.Context,
	orderID, userID string,
	amount int64,
) (StripeIntent, error) {
	intent, err := g.client.V1PaymentIntents.Create(ctx, &stripe.PaymentIntentCreateParams{
		Amount:   stripe.Int64(amount),
		Currency: stripe.String("usd"),
		Metadata: map[string]string{
			"order_id": orderID,
			"user_id":  userID,
		},
	})
	if err != nil {
		return StripeIntent{}, fmt.Errorf("create Stripe PaymentIntent: %w", err)
	}
	return StripeIntent{ID: intent.ID, ClientSecret: intent.ClientSecret}, nil
}

func (g *StripeGateway) GetPaymentIntent(ctx context.Context, transactionID string) (StripeIntent, error) {
	intent, err := g.client.V1PaymentIntents.Retrieve(ctx, transactionID, nil)
	if err != nil {
		return StripeIntent{}, fmt.Errorf("retrieve Stripe PaymentIntent %s: %w", transactionID, err)
	}
	return StripeIntent{ID: intent.ID, ClientSecret: intent.ClientSecret}, nil
}
