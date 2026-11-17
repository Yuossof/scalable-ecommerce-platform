import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { OrdersService } from "./orders.service.js";

describe("OrdersService.create", () => {
    it("returns the created order when the notification service is unavailable", async () => {
        const order = {
            id: "order-1",
            user_id: "user-1",
            total: 10,
        };
        const service = new OrdersService(
            {
                createWithItems: async () => ({ order, orderItems: [] }),
            } as never,
            {
                getCartItems: async () => [
                    { cart_id: "cart-1", quantity: 2, price: 5 },
                ],
            } as never,
            {
                createPaymentIntent: async () => ({ clientSecret: "client-secret" }),
            } as never,
            async () => {
                throw new Error("notification service unavailable");
            }
        );
        const loggedErrors: unknown[][] = [];
        const originalConsoleError = console.error;
        console.error = (...args) => loggedErrors.push(args);

        try {
            const result = await service.create("user-1");
            await new Promise<void>((resolve) => setImmediate(resolve));

            assert.equal(result.order.id, "order-1");
            assert.equal(result.clientSecret, "client-secret");
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
