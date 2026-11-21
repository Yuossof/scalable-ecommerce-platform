# Payment Service (Go)

Owns all payment processing. The TypeScript API only verifies Stripe webhook
signatures and forwards events; Stripe PaymentIntents, payment rows, order
statuses, inventory updates and customer notifications are handled here.

## Flow

```text
POST /api/orders (TS API)
    │  payment.create RPC (request/reply)
    ▼
Go payment service ──Stripe API──▶ PaymentIntent
    │  INSERT payments (pending)
    │  reply { ok, data: { payment, client_secret } }
    ▼
TS API returns clientSecret to the web

Stripe webhook ──▶ POST /api/webhooks/payments (TS API, signature check)
                      │  payment_queue (persistent)
                      ▼
                  Go payment service
                      │  transaction: payments.status, inventory, orders.payment_status
                      │  notifications queue (persistent)
                      ▼
                  Go notification service (email)
```

## Queues

| Queue | Direction | Payload |
| --- | --- | --- |
| `payment.create` | API → Go (RPC) | `{ "order_id", "user_id", "amount" }` + AMQP `reply_to` / `correlation_id` |
| `payment_queue` | API → Go (events) | `{ "paymentIntent": { "id", "metadata": { "order_id", "user_id" } }, "status", "event_id", "event_type" }` |
| `notifications` | Go → notification service | `{ "email", "subject", "body" }` |

All queues are durable and all messages are persistent. RPC replies are
correlation-matched; unmatched correlation IDs are ignored.

Statuses are normalised before being stored: `success`, `paid` and `succeeded`
become `success`; `cancelled` becomes `canceled`. Only `success` decrements
stock. Repeated webhook deliveries are idempotent because the status update is
guarded with `status <> $1` inside the same transaction as the inventory and
order updates.

If a `payment.create` request is redelivered after a pending payment was
already inserted, the existing Stripe PaymentIntent is retrieved and its client
secret is returned instead of creating a duplicate intent.

Notification publishing is best-effort: a missing user, a failed lookup or a
RabbitMQ error is logged, but the payment event is still ACKed so email delivery
can never block an order.

Malformed event messages and permanent failures are NACKed without requeue to
avoid a hot redelivery loop. Create-payment RPC failures are returned as error
replies (and ACKed) so the API can map them to an HTTP error.

## Configuration

Copy `.env.example` to `.env` and fill it in. Required values are
`RABBITMQ_URL`, `STRIPE_SECRET_KEY` and either `DATABASE_URL` or `DB_USER` plus
the other `DB_*` variables. `DB_PORT` defaults to `5432` inside Compose; use
`5433` when running against the host-mapped PostgreSQL.

## Run locally

```bash
go test ./...
go run ./cmd/server
```

The service connects to PostgreSQL and RabbitMQ on startup and logs which
queues it is consuming. `SIGINT`/`SIGTERM` stop both workers gracefully.

## Docker

```bash
docker compose up -d --build payment
```
