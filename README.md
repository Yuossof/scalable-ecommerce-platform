# E-Commerce Platform

A full-stack e-commerce monorepo composed of three projects:

| Project | Path | Description |
| --- | --- | --- |
| **API** | [`api/`](./api) | Express + TypeScript REST API. Owns the database, auth, catalog, cart, orders, Stripe payments and webhooks. |
| **Web** | [`web/`](./web) | Next.js 16 storefront (App Router) that consumes the API and handles Stripe checkout. |
| **Notification Service** | [`services/notification/`](./services/notification) | Go microservice that consumes RabbitMQ messages and sends transactional email via Resend. |

Each project has its own README with setup, scripts and internals:

- [API README](./api/README.md)
- [Web README](./web/README.md)
- [Notification Service README](./services/notification/README.md)

## Architecture

```text
                    ┌─────────────────────────┐
                    │   web/  (Next.js :3000) │
                    └────────────┬────────────┘
                                 │ REST /api (cookies, CORS)
                                 ▼
   Stripe ──webhook──▶ ┌─────────────────────────┐   RabbitMQ queues     ┌──────────────────────────┐
                       │   api/  (Express :8090) │ ───────────────────▶ │ services/notification/   │
                       └────────────┬────────────┘  notifications queue  │ (Go, sends email/Resend) │
                                    │                                   └──────────────────────────┘
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
         PostgreSQL             Redis               RabbitMQ
          (:5433)              (:6379)          (:5672 / UI :15672)
```

- The **web** app talks only to the **api** over REST, authenticating with
  HTTP-only cookies. It never talks to the notification service directly.
- The **api** publishes notification events to RabbitMQ, which the notification
  service consumes. Publishing is best-effort after payment status updates so
  email failures never block an order.
- PostgreSQL, Redis and RabbitMQ are supporting infrastructure for the API and
  are started by the root `docker-compose.yaml`, together with the API and
  notification service.

## Ports

| Service | Port |
| --- | --- |
| Web (Next.js) | `3000` |
| API (Express) | `8090` |
| PostgreSQL | `5433` |
| Redis | `6379` |
| RabbitMQ | `5672` (AMQP), `15672` (management UI) |

Published host ports can be overridden with the service's `*_HOST_PORT`
variables (for example, `POSTGRES_HOST_PORT` or `RABBITMQ_AMQP_HOST_PORT`). The
API and other containers continue to communicate over Compose's internal
network on their normal container ports.

## Quick Start

The projects are independent and are installed/run separately. A typical local
run order is: infrastructure → notification service → API → web.

### 1. Infrastructure + API

```bash
cd api
cp .env.example .env          # fill in DB, JWT, Stripe, R2, Resend secrets
docker compose up --build     # starts Postgres, Redis, RabbitMQ and the API
```

The API is then available at `http://localhost:8090` (health check:
`GET /health`). See the [API README](./api/README.md) for running it without
Docker (`npm install && npm run db:migrate && npm run dev`).

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
│   └── notification/           # Go email consumer
│       ├── cmd/server/         # entry point
│       └── internal/           # queue consumer + email sender
└── README.md                   # this file
```

## Shared Contract

The API and the notification service communicate through the durable RabbitMQ
`notifications` queue. Messages are JSON with `email`, `subject`, and `body`
fields; see the
[Notification Service README](./services/notification/README.md#message-format)
for details.

## Security Notes

- Secrets live only in each project's `.env` (never committed). Each project
  exposes an `.env.example` (API) or documents required variables.
- The web app only ever holds the Stripe **publishable** key; the secret key
  stays in `api/.env`.
- Rotate any credential that has been shared in plaintext, and add a
  `.gitignore` that excludes `.env` before initialising a repository in a
  project that lacks one.
# scalable-ecommerce-platform
