import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.STRIPE_SECRET_KEY ??= "sk_test_unit_test";
const { PaymentsService } = await import("./payments.service.js");

describe("PaymentsService.handlePaymentStatus", () => {
    it("updates payment status and publishes the notification to the queue", async () => {
        let updatedPayment: { status: string; orderId: string } | undefined;
        let publishedMessage: { email: string; subject: string; body: string } | undefined;
        const service = new PaymentsService(
            {
                updatePaymentStatus: async (status: string, orderId: string) => {
                    updatedPayment = { status, orderId };
                },
            } as never,
            {
                findByID: async (userId: string) => {
                    assert.equal(userId, "user-1");
                    return { id: userId, password: "hash", email: "user@example.com" };
                },
            } as never,
            async (message) => {
                publishedMessage = message;
            }
        );

        await service.handlePaymentStatus("paid", {
            metadata: { order_id: "order-1", user_id: "user-1" },
        } as never);
        await new Promise<void>((resolve) => setImmediate(resolve));

        assert.deepEqual(updatedPayment, {
            status: "paid",
            orderId: "order-1",
        });
        assert.deepEqual(publishedMessage, {
            email: "user@example.com",
            subject: "Order Confirmed",
            body: "Your order has been confirmed",
        });
    });

    it("still updates payment status when publishing the notification fails", async () => {
        let updatedPayment: { status: string; orderId: string } | undefined;
        const service = new PaymentsService(
            {
                updatePaymentStatus: async (status: string, orderId: string) => {
                    updatedPayment = { status, orderId };
                },
            } as never,
            {
                findByID: async () => ({ id: "user-1", password: "hash", email: "user@example.com" }),
            } as never,
            async () => {
                throw new Error("rabbitmq unavailable");
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