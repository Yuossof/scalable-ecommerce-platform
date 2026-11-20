import Stripe from "stripe";
import { stripeClient } from "../../lib/stripe/stripe.lib.js";
import { PaymentsRepository } from "./payments.repository.js";
import { PaymentStatus } from "./payments.types.js";
import { AuthRepository } from "../auth/auth.repository.js";
import {
  NotificationMessage,
  publishNotificationMessage,
} from "../notification/notification.publisher.js";

export class PaymentsService {
    private paymentRepository: PaymentsRepository
    private authRepository: AuthRepository
    private notificationPublisher: (message: NotificationMessage) => Promise<void>

    constructor(
        paymentRepository: PaymentsRepository,
        authRepository: AuthRepository,
        notificationPublisher: (message: NotificationMessage) => Promise<void> = publishNotificationMessage,
    ) {
        this.paymentRepository = paymentRepository
        this.authRepository = authRepository
        this.notificationPublisher = notificationPublisher
    }

    async createPaymentIntent(orderId: string, amount: number, userId: string) {
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            metadata: {
                order_id: orderId,
                user_id: userId
            }
        })

        const payment = await this.paymentRepository.createPayment({
            order_id: orderId,
            provider: 'stripe',
            transaction_id: paymentIntent.id,
            amount: amount,
            status: 'pending',
        });

        return {
            payment,
            clientSecret: paymentIntent.client_secret,
        };
    }


    async handlePaymentStatus(status: PaymentStatus, paymentIntent: Stripe.PaymentIntent) {
        const orderId = paymentIntent.metadata.order_id
        const userId = paymentIntent.metadata.user_id

        await this.paymentRepository.updatePaymentStatus(status, orderId)

        void Promise.resolve()
            .then(async () => {
                if (!userId) {
                    console.error("Cannot send order confirmation notification: missing userId in payment metadata", {
                        orderId: orderId,
                    });
                    return;
                }

                const user = await this.authRepository.findByID(userId);
                if (!user?.email) {
                    console.error("Cannot send order confirmation notification: user email not found", {
                        orderId: orderId,
                        userId: userId,
                    });
                    return;
                }

                await this.notificationPublisher({
                    email: user.email,
                    subject: "Order Confirmed",
                    body: "Your order has been confirmed",
                });
            })
            .catch((error: unknown) => {
                console.error("Failed to send order confirmation notification", {
                    orderId: orderId,
                    error,
                });
            });
    }
}
