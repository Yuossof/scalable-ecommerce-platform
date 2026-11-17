import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.STRIPE_SECRET_KEY ??= "sk_test_unit_test";
const { PaymentsService } = await import("./payments.service.js");

describe("PaymentsService.handlePaymentStatus", () => {
    it("updates payment status when the notification service is unavailable", async () => {
        let updatedPayment: { status: string; orderId: string } | undefined;
        const service = new PaymentsService(
            {
                updatePaymentStatus: async (status: string, orderId: string) => {
                    updatedPayment = { status, orderId };
                },
            } as never,
            async () => {
                throw new Error("notification service unavailable");
            }
        );
        const loggedErrors: unknown[][] = [];
        const originalConsoleError = console.error;
        console.error = (...args) => loggedErrors.push(args);

        try {
            await service.handlePaymentStatus("paid", {
                metadata: { order_id: "order-1", user_id: "user-1" },
            } as never);
            await new Promise<void>((resolve) => setImmediate(resolve));

            assert.deepEqual(updatedPayment, {
                status: "paid",
                orderId: "order-1",
            });
            assert.equal(
                loggedErrors.some(
                    ([message]) => message === "Failed to send order confirmation notification"
                ),
                true
            );
        } finally {
            console.error = originalConsoleError;
        }
    });
});
