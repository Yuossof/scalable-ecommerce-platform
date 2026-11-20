# Notification Service

Go microservice that sends transactional email for the E-Commerce platform. It
consumes messages from RabbitMQ and delivers them with
[Resend](https://resend.com).

## Relationship to the API

The notification service is a **downstream consumer of the API**, not of the web
client. The flow is:

```text
Stripe webhook ──▶ API ──▶ RabbitMQ ──▶ Notification Service ──▶ Resend ──▶ Customer inbox
   payment_queue     notifications queue         (Go worker)
```

- The Stripe webhook publishes the payment intent to the `payment_queue` queue in
  RabbitMQ.
- The API's payment worker updates the order/payment status and the API resolves
  the customer email, then publishes a notification event to the `notifications`
  queue via
  [`api/src/modules/notification/notification.publisher.ts`](../api/src/modules/notification/notification.publisher.ts).
- This service consumes the `notifications` queue in
  [`internal/notification/server.go`](./internal/notification/server.go) and sends
  the email through Resend.
- Notification delivery is **best-effort** from the API's perspective: a publish
  failure is logged and never blocks the payment response.

## Message format

Messages published to the `notifications` queue are JSON objects:

```json
{
  "email": "customer@example.com",
  "subject": "Order Confirmed",
  "body": "<p>Your order has been confirmed</p>"
}
```

The queue is durable and messages are published as persistent. The worker uses a
prefetch of 5 and acknowledges messages only after a successful send. Malformed
or unsendable messages are rejected without requeue and logged.

## Technology Stack

- Go 1.27
- RabbitMQ (`github.com/rabbitmq/amqp091-go`)
- Resend Go SDK (`github.com/resend/resend-go/v4`)
- `godotenv` for local environment loading

## Project Structure

```text
services/notification/
├── cmd/
│   └── server/
│       └── main.go                  # Entry point: loads .env, connects to RabbitMQ, starts the worker
├── internal/
│   └── notification/
│       └── server.go                # Queue consumer + Resend mail sender
├── go.mod
└── go.sum
```

## Getting Started

Fetch dependencies:

```bash
go mod download
```

Create `.env` from the example and fill in the secrets:

```bash
cp .env.example .env
```

Run the worker:

```bash
go run ./cmd/server
```

The process logs `Notification worker listening on queue "notifications"` and
stays running until SIGINT/SIGTERM.

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `RABBITMQ_URL` | Yes | AMQP connection URL, e.g. `amqp://guest:guest@localhost:5672`. Compose sets it to the internal `rabbitmq` host. |
| `RESEND_API_KEY` | Yes | Resend API key used to send emails. |

`godotenv` loads these from a local `.env` file. In production, inject real
environment variables (Docker Compose uses an env file).

## Notes

- The sender address is currently `Acme <onboarding@resend.dev>`; replace it with
  a verified Resend domain address for production use.
- There is no dead-letter queue: messages that fail to send are dropped after a
  single attempt and logged. Add a DLQ/retry policy before relying on this for
  critical delivery guarantees.
