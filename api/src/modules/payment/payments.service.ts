import Stripe from "stripe";
import { stripeClient } from "../../lib/stripe/stripe.lib";
import { PaymentsRepository } from "./payments.repository";
import { PaymentStatus } from "./payments.types";
import { notifyUser } from "../../grpc/notifications/notification.client";

export class PaymentsService {
    private paymentRepository: PaymentsRepository
    private notificationSender: typeof notifyUser
    constructor(
        paymentRepository: PaymentsRepository,
        notificationSender: typeof notifyUser = notifyUser

    ) {
        this.paymentRepository = paymentRepository
        this.notificationSender = notificationSender
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
            .then(() => this.notificationSender({
                userId: userId,
                title: "Order Confirmed",
                body: "Your order has been confirmed",
            }))
            .then((result) => {
                if (!result.success) {
                    console.error("Notification service rejected order confirmation", {
                        orderId: orderId,
                        message: result.message,
                    });
                }
            })
            .catch((error: unknown) => {
                console.error("Failed to send order confirmation notification", {
                    orderId: orderId,
                    error,
                });
            });
    }
}