import { rabbitMQ } from "../../config/rabbitmq.js";

export interface NotificationMessage {
  email: string;
  subject: string;
  body: string;
}

export async function publishNotificationMessage(message: NotificationMessage): Promise<void> {
  const channel = await rabbitMQ.createChannel();
  const queueName = "notifications";

  try {
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  } finally {
    try {
      await channel.close();
    } catch {
      // ignore channel close errors
    }
  }
}
