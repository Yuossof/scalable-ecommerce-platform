import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PAYMENT_CREATE_QUEUE, PaymentsService } from "./payments.service.js";
import type { CreatePaymentResponse } from "./payments.types.js";

type SentMessage = {
  queue: string;
  body: { order_id: string; user_id: string; amount: number };
  properties: { correlationId?: string; replyTo?: string; persistent?: boolean };
};

class FakeChannel {
  readonly sent: SentMessage[] = [];
  reply: CreatePaymentResponse = {
    ok: true,
    data: {
      payment: {
        id: "pay-1",
        order_id: "order-1",
        provider: "stripe",
        transaction_id: "pi_1",
        amount: 12.34,
        status: "pending",
      },
      client_secret: "pi_1_secret",
    },
  };
  autoReply = true;

  private handler?: (message: unknown) => void;

  async assertQueue(name: string) {
    return { queue: name || "amq.gen-reply-1", messageCount: 0, consumerCount: 0 };
  }

  async consume(_queue: string, handler: (message: unknown) => void) {
    this.handler = handler;
    return { consumerTag: "consumer-1" };
  }

  sendToQueue(queue: string, body: Buffer, properties: SentMessage["properties"]) {
    this.sent.push({
      queue,
      body: JSON.parse(body.toString("utf8")) as SentMessage["body"],
      properties,
    });

    if (!this.autoReply) return;
    const correlationId = properties.correlationId;
    setImmediate(() => {
      this.handler?.({
        content: Buffer.from(JSON.stringify(this.reply), "utf8"),
        properties: { correlationId },
      });
    });
  }

  async close() {}
}

const brokerFor = (channel: FakeChannel) => ({
  createChannel: async () => channel as never,
});

describe("PaymentsService.createPaymentIntent", () => {
  it("sends an RPC request and returns the client secret from the Go service", async () => {
    const channel = new FakeChannel();
    const service = new PaymentsService(brokerFor(channel));

    const result = await service.createPaymentIntent("order-1", 12.34, "user-1");

    assert.equal(result.clientSecret, "pi_1_secret");
    assert.equal(result.payment.transaction_id, "pi_1");
    assert.equal(channel.sent.length, 1);
    assert.equal(channel.sent[0].queue, PAYMENT_CREATE_QUEUE);
    assert.deepEqual(channel.sent[0].body, {
      order_id: "order-1",
      user_id: "user-1",
      amount: 12.34,
    });
    assert.ok(channel.sent[0].properties.correlationId);
    assert.ok(channel.sent[0].properties.replyTo);
    assert.equal(channel.sent[0].properties.persistent, true);
  });

  it("rejects an error reply from the Go service", async () => {
    const channel = new FakeChannel();
    channel.reply = { ok: false, error: { code: "payment_provider_error", message: "Stripe unavailable" } };
    const service = new PaymentsService(brokerFor(channel));

    await assert.rejects(
      service.createPaymentIntent("order-1", 10, "user-1"),
      (error: Error & { statusCode?: number }) => {
        assert.equal(error.message, "Stripe unavailable");
        assert.equal(error.statusCode, 502);
        return true;
      },
    );
  });

  it("times out when the Go service never replies", async () => {
    const channel = new FakeChannel();
    channel.autoReply = false;
    const service = new PaymentsService(brokerFor(channel), 20);

    await assert.rejects(
      service.createPaymentIntent("order-1", 10, "user-1"),
      /did not respond in time/,
    );
  });

  it("ignores replies with a different correlation id", async () => {
    const channel = new FakeChannel();
    const service = new PaymentsService(brokerFor(channel));

    const result = await service.createPaymentIntent("order-1", 10, "user-1");

    assert.equal(result.clientSecret, "pi_1_secret");
  });
});
