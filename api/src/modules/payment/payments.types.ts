export type PaymentStatus = "pending" | "paid" | "failed" | "success" | "canceled"

/** A payment row as returned by the Go payment service. */
export interface PaymentRecord {
    id: string;
    order_id: string;
    provider: string;
    transaction_id: string;
    amount: number;
    status: PaymentStatus;
}

/** Request published to the Go service's `payment.create` RPC queue. */
export interface CreatePaymentRequest {
    order_id: string;
    user_id: string;
    amount: number;
}

/** Successful reply from the Go payment service. */
export interface CreatePaymentResult {
    payment: PaymentRecord;
    client_secret: string;
}

export interface PaymentRPCError {
    code: string;
    message: string;
}

/** Reply envelope from the Go payment service. */
export interface CreatePaymentResponse {
    ok: boolean;
    data?: CreatePaymentResult;
    error?: PaymentRPCError;
}
