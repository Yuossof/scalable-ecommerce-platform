import { randomUUID } from "node:crypto";
import type { Channel, Message } from "amqplib";
import { BaseError } from "../../common/errors/base.error.js";
import { rabbitMQ } from "../../config/rabbitmq.js";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentRecord,
} from "./payments.types.js";

export const PAYMENT_CREATE_QUEUE = "payment.create";

/** Minimal broker surface needed by the service (easy to fake in tests). */
export interface ChannelProvider {
  createChannel(): Promise<Channel>;
}

/**
 * Thin client for the Go payment service.
 *
 * The TypeScript API no longer talks to Stripe, writes payment rows, or
 * updates inventory. It sends a request to the durable `payment.create` RPC
 * queue and waits for the reply on a temporary, exclusive reply queue.
 */
export class PaymentsService {
  constructor(
    private readonly broker: ChannelProvider = rabbitMQ,
    private readonly timeoutMs: number = 15_000,
  ) {}

  async createPaymentIntent(
    orderId: string,
    amount: number,
    userId: string,
  ): Promise<{ payment: PaymentRecord; clientSecret: string }> {
    const channel = await this.broker.createChannel();

    try {
      await channel.assertQueue(PAYMENT_CREATE_QUEUE, { durable: true });
      const replyQueue = await channel.assertQueue("", {
        exclusive: true,
        autoDelete: true,
      });
      const correlationId = randomUUID();

      const response = await new Promise<CreatePaymentResponse>((resolve, reject) => {
        let settled = false;
        let timer: NodeJS.Timeout | undefined;

        const settle = (action: () => void) => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          action();
        };

        timer = setTimeout(() => {
          settle(() =>
            reject(
              new BaseError(
                "PaymentServiceTimeout",
                504,
                true,
                "Payment service did not respond in time",
              ),
            ),
          );
        }, this.timeoutMs);

        const handleReply = (message: Message | null) => {
          if (!message || message.properties.correlationId !== correlationId) {
            return;
          }

          let parsed: CreatePaymentResponse;
          try {
            parsed = JSON.parse(message.content.toString("utf8")) as CreatePaymentResponse;
          } catch (error) {
            settle(() => reject(error));
            return;
          }

          settle(() => {
            if (parsed.ok && parsed.data) {
              resolve(parsed);
              return;
            }
            reject(
              new BaseError(
                "PaymentServiceError",
                502,
                true,
                parsed.error?.message ?? "Payment service rejected the request",
              ),
            );
          });
        };

        void channel
          .consume(replyQueue.queue, handleReply, { noAck: true })
          .then(() => {
            const request: CreatePaymentRequest = {
              order_id: orderId,
              user_id: userId,
              amount,
            };
            channel.sendToQueue(
              PAYMENT_CREATE_QUEUE,
              Buffer.from(JSON.stringify(request), "utf8"),
              {
                correlationId,
                replyTo: replyQueue.queue,
                persistent: true,
                contentType: "application/json",
              },
            );
          })
          .catch((error: unknown) => settle(() => reject(error)));
      });

      if (!response.data) {
        throw new BaseError(
          "PaymentServiceError",
          502,
          true,
          "Payment service returned an empty response",
        );
      }

      return {
        payment: response.data.payment,
        clientSecret: response.data.client_secret,
      };
    } finally {
      try {
        await channel.close();
      } catch {
        // The reply queue is exclusive to this channel; closing is best effort.
      }
    }
  }
}
