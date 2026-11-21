import Stripe from "stripe";
import { rabbitMQ } from "../../../config/rabbitmq.js";
import { PaymentStatus } from "../../payment/payments.types.js";

export class StripeWebhookService {
  async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case "payment_intent.succeeded":
        return this.sendPaymentToQueue(
          event.data.object as Stripe.PaymentIntent,
          "success",
          event.id,
          event.type,
        )
      case "payment_intent.payment_failed":
        return this.sendPaymentToQueue(
          event.data.object as Stripe.PaymentIntent,
          "failed",
          event.id,
          event.type,
        )

      case "payment_intent.canceled":
        return this.sendPaymentToQueue(
          event.data.object as Stripe.PaymentIntent,
          "canceled",
          event.id,
          event.type,
        )

      default:
        return
    }
  }

  async sendPaymentToQueue(
    paymentIntent: Stripe.PaymentIntent,
    status: PaymentStatus,
    eventId?: string,
    eventType?: string,
  ) {
    const channel = await rabbitMQ.createChannel();
    const queueName = 'payment_queue';

    try {
      await channel.assertQueue(queueName, { durable: true });

      channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify({
          paymentIntent,
          status,
          event_id: eventId,
          event_type: eventType,
        })),
        {
          persistent: true,
          contentType: "application/json",
        }
      );

      console.log(` [x] Payment sent to queue for order: ${paymentIntent.metadata.order_id}`);
    } finally {
      try {
        await channel.close();
      } catch {
        // ignore channel close errors
      }
    }
  }
}
