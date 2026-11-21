# E-Commerce Platform

A full-stack e-commerce monorepo composed of three projects:

| Project | Path | Description |
| --- | --- | --- |
| **API** | [`api/`](./api) | Express + TypeScript REST API. Owns auth, catalog, cart, orders, Stripe webhook signature verification and payment RPC requests. |
| **Web** | [`web/`](./web) | Next.js 16 storefront (App Router) that consumes the API and handles Stripe checkout. |
| **Payment Service** | [`services/payment/`](./services/payment) | Go microservice that creates Stripe PaymentIntents and applies payment status, inventory and order updates from RabbitMQ. |
| **Notification Service** | [`services/notification/`](./services/notification) | Go microservice that consumes RabbitMQ messages and sends transactional email via Resend. |

Each project has its own README with setup, scripts and internals:

- [API README](./api/README.md)
- [Web README](./web/README.md)
- [Payment Service README](./services/payment/README.md)
- [Notification Service README](./services/notification/README.md)

## Architecture

```text
                    ┌─────────────────────────┐
                    │   web/  (Next.js :3000) │
                    └────────────┬────────────┘
                                 │ REST /api (cookies, CORS)
                                 ▼
    Stripe ──webhook──▶ ┌─────────────────────────┐
                        │   api/  (Express :8090) │
                        └───────┬─────────┬───────┘
                 payment.create │         │ payment_queue
                     (RPC)      ▼         ▼
                   ┌──────────────────────────────┐   notifications   ┌──────────────────────────┐
                   │ services/payment/ (Go)       │ ────────────────▶ │ services/notification/   │
                   │ Stripe API + payments/orders │      queue        │ (Go, sends email/Resend) │
                   └──────────┬───────────────────┘                   └──────────────────────────┘
               ┌──────────────┼───────────────────┐
               ▼              ▼                   ▼
          PostgreSQL        Redis              RabbitMQ
           (:5433)         (:6379)          (:5672 / UI :15673)
```

- The **web** app talks only to the **api** over REST, authenticating with
  HTTP-only cookies. It never talks to the notification service directly.
- The **api** sends payment creation requests to the Go payment service over the
  `payment.create` RPC queue and forwards verified Stripe events to
  `payment_queue`. It no longer writes payment rows, updates inventory, or
  creates PaymentIntents itself.
- The **payment service** owns Stripe, the payment/order status updates and
  inventory. It publishes to the durable `notifications` queue; email delivery
  is best-effort so it never blocks an order.
- PostgreSQL, Redis and RabbitMQ are supporting infrastructure for the API and
  are started by the root `docker-compose.yaml`, together with the payment and
  notification services.

## Ports

| Service | Port |
| --- | --- |
| Web (Next.js) | `3000` |
| API (Express) | `8090` |
| PostgreSQL | `5433` |
| Redis | `6379` |
| RabbitMQ | `5672` (AMQP), `15673` (management UI, host) |

Published host ports can be overridden with the service's `*_HOST_PORT`
variables (for example, `POSTGRES_HOST_PORT` or `RABBITMQ_AMQP_HOST_PORT`). The
API and other containers continue to communicate over Compose's internal
network on their normal container ports.

## Quick Start

The projects are independent and are installed/run separately. A typical local
run order is: infrastructure → payment service → notification service → API → web.
The root `docker-compose.yaml` starts them all in dependency order:

```bash
docker compose up -d --build
```

The API is then available at `http://localhost:8090` (health check:
`GET /health`). See the [API README](./api/README.md) for running it without
Docker (`npm install && npm run db:migrate && npm run dev`).

### 1. Payment service

Compose reuses `secrets/api.env` for the payment service's database and Stripe
credentials. For local development outside Compose:

```bash
cd services/payment
cp .env.example .env          # set DATABASE_URL/DB_*, RABBITMQ_URL, STRIPE_SECRET_KEY
go test ./...
go run ./cmd/server           # consumes payment_queue and payment.create
```

### 2. Notification service

When using the root Docker Compose file, set `RESEND_API_KEY` in
`secrets/notification.env`; Compose starts the notification service, connects it
to RabbitMQ, and the API publishes to the `notifications` queue. For local
development outside Compose:

```bash
cd services/notification
cp .env.example .env          # set RESEND_API_KEY and RABBITMQ_URL
go run ./cmd/server           # consumes the "notifications" queue
```

### 3. Web

```bash
cd web
npm install
# .env: NEXT_PUBLIC_API_URL=http://localhost:8090 and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
npm run dev                   # http://localhost:3000
```

## Repository Layout

```text
E-commerce/
├── api/                        # Express + TypeScript REST API
│   ├── migrations/             # SQL migrations
│   ├── src/                    # app, modules, config, middleware, lib
│   ├── docker-compose.yaml     # Postgres, Redis, RabbitMQ, API
│   └── Dockerfile
├── web/                        # Next.js storefront
│   └── src/                    # app routes, features, shared, store
├── services/
│   ├── payment/                # Go payment service
│   │   ├── cmd/server/         # entry point
│   │   └── internal/           # config, Stripe gateway, repository, workers
│   └── notification/           # Go email consumer
│       ├── cmd/server/         # entry point
│       └── internal/           # queue consumer + email sender
└── README.md                   # this file
```

## Shared Contract

- The API and the payment service exchange JSON over the durable
  `payment.create` (RPC) and `payment_queue` (events) queues. Contracts are
  documented in the [Payment Service README](./services/payment/README.md#queues).
- The payment and notification services communicate through the durable
  `notifications` queue. Messages are JSON with `email`, `subject`, and `body`
  fields; see the
  [Notification Service README](./services/notification/README.md#message-format)
  for details.

## Security Notes

- Secrets live only in each project's `.env` (never committed). Each project
  exposes an `.env.example` (API) or documents required variables.
- The web app only ever holds the Stripe **publishable** key; the secret key
  stays with the Go payment service (`services/payment/.env`, or `secrets/api.env`
  when running through Compose).
- Rotate any credential that has been shared in plaintext, and add a
  `.gitignore` that excludes `.env` before initialising a repository in a
  project that lacks one.
# scalable-ecommerce-platform
