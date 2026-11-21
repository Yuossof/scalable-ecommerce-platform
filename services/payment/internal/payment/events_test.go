package payment

import (
	"encoding/json"
	"testing"
)

func TestCreatePaymentResponseJSONContract(t *testing.T) {
	response := CreatePaymentResponse{
		OK: true,
		Data: &CreatePaymentResult{
			Payment:      Payment{ID: "pay-1", OrderID: "order-1"},
			ClientSecret: "pi_1_secret",
		},
	}

	body, err := json.Marshal(response)
	if err != nil {
		t.Fatalf("unexpected marshal error: %v", err)
	}
	var decoded map[string]any
	if err := json.Unmarshal(body, &decoded); err != nil {
		t.Fatalf("unexpected unmarshal error: %v", err)
	}
	if decoded["ok"] != true {
		t.Fatalf("missing ok field: %s", body)
	}
	data, ok := decoded["data"].(map[string]any)
	if !ok || data["client_secret"] != "pi_1_secret" {
		t.Fatalf("unexpected RPC payload: %s", body)
	}
}

func TestNormalizeStatus(t *testing.T) {
	tests := map[string]string{
		"success":   StatusSuccess,
		"paid":      StatusSuccess,
		"Succeeded": StatusSuccess,
		" failed ":  StatusFailed,
		"cancelled": StatusCanceled,
	}

	for input, want := range tests {
		got, ok := NormalizeStatus(input)
		if !ok || got != want {
			t.Fatalf("NormalizeStatus(%q) = %q, %v; want %q, true", input, got, ok, want)
		}
	}

	if _, ok := NormalizeStatus("refunded"); ok {
		t.Fatal("NormalizeStatus accepted an unknown status")
	}
}

func TestPaymentEventValidate(t *testing.T) {
	valid := PaymentEvent{
		PaymentIntent: WebhookPaymentIntent{
			ID:       "pi_1",
			Metadata: PaymentIntentMetadata{OrderID: "order-1", UserID: "user-1"},
		},
		Status: "success",
	}
	if err := valid.Validate(); err != nil {
		t.Fatalf("unexpected validation error: %v", err)
	}

	missingOrder := valid
	missingOrder.PaymentIntent.Metadata.OrderID = ""
	if err := missingOrder.Validate(); err == nil {
		t.Fatal("expected an error for a missing order id")
	}

	badStatus := valid
	badStatus.Status = "unknown"
	if err := badStatus.Validate(); err == nil {
		t.Fatal("expected an error for an unknown status")
	}
}

func TestCreatePaymentRequestValidate(t *testing.T) {
	valid := CreatePaymentRequest{OrderID: "order-1", UserID: "user-1", Amount: 42.5}
	if err := valid.Validate(); err != nil {
		t.Fatalf("unexpected validation error: %v", err)
	}

	for _, invalid := range []CreatePaymentRequest{
		{UserID: "user-1", Amount: 10},
		{OrderID: "order-1", Amount: 10},
		{OrderID: "order-1", UserID: "user-1", Amount: 0},
		{OrderID: "order-1", UserID: "user-1", Amount: -1},
		{OrderID: "order-1", UserID: "user-1", Amount: 1e10},
	} {
		if err := invalid.Validate(); err == nil {
			t.Fatalf("expected validation error for %+v", invalid)
		}
	}
}

func TestToMinorUnits(t *testing.T) {
	if got := ToMinorUnits(12.345); got != 1235 {
		t.Fatalf("ToMinorUnits(12.345) = %d; want 1235", got)
	}
	if got := ToMinorUnits(0.1 + 0.2); got != 30 {
		t.Fatalf("ToMinorUnits(0.3) = %d; want 30", got)
	}
}

func TestNotificationForStatus(t *testing.T) {
	success, ok := NotificationForStatus(StatusSuccess)
	if !ok || success.Subject != "Order Confirmed" || success.Body != "Your order has been confirmed" {
		t.Fatalf("unexpected success notification: %+v, %v", success, ok)
	}
	if _, ok := NotificationForStatus(StatusPending); ok {
		t.Fatal("pending payments should not trigger a notification")
	}
}
