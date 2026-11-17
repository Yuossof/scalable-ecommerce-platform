# E-Commerce Platform

A full-stack e-commerce monorepo composed of three projects:

| Project | Path | Description |
| --- | --- | --- |
| **API** | [`api/`](./api) | Express + TypeScript REST API. Owns the database, auth, catalog, cart, orders, Stripe payments and webhooks. |
| **Web** | [`web/`](./web) | Next.js 16 storefront (App Router) that consumes the API and handles Stripe checkout. |
| **Notification Service** | [`services/notification/`](./services/notification) | Go gRPC microservice that sends transactional email via Resend. Called by the API. |

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
   Stripe ──webhook──▶ ┌─────────────────────────┐      gRPC :50051      ┌──────────────────────────┐
                       │   api/  (Express :8090) │ ───────────────────▶ │ services/notification/   │
                       └────────────┬────────────┘                      │ (Go, sends email/Resend) │
                                    │                                   └──────────────────────────┘
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
         PostgreSQL             Redis               RabbitMQ
          (:5433)              (:6379)          (:5672 / UI :15672)
```

- The **web** app talks only to the **api** over REST, authenticating with
  HTTP-only cookies. It never talks to the notification service directly.
- The **api** is the gRPC **client** of the notification service; it calls it
  best-effort after payment status updates so email failures never block an
  order.
- PostgreSQL, Redis and RabbitMQ are supporting infrastructure for the API and
  are started by the API's `docker-compose.yaml`.

## Ports

| Service | Port |
| --- | --- |
| Web (Next.js) | `3000` |
| API (Express) | `8090` |
| Notification service (gRPC) | `50051` |
| PostgreSQL | `5433` |
| Redis | `6379` |
| RabbitMQ | `5672` (AMQP), `15672` (management UI) |

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

```bash
cd services/notification
# create .env with RESEND_API_KEY=...
go run ./cmd/server           # gRPC on :50051
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
│   ├── proto/                  # gRPC contract (client copy)
│   ├── src/                    # app, modules, config, middleware, lib
│   ├── docker-compose.yaml     # Postgres, Redis, RabbitMQ, API
│   └── Dockerfile
├── web/                        # Next.js storefront
│   └── src/                    # app routes, features, shared, store
├── services/
│   └── notification/           # Go gRPC email service
│       ├── cmd/server/         # entry point
│       ├── internal/           # service implementation
│       ├── proto/              # gRPC contract (server copy)
│       └── gen/                # generated stubs
└── README.md                   # this file
```

## Shared Contract

The API and the notification service share the gRPC contract in
`notification.proto`, which is duplicated in both projects:

```text
api/proto/notification.proto
services/notification/proto/notification.proto
```

Keep the two copies in sync when the contract changes. See the
[Notification Service README](./services/notification/README.md#regenerating-the-grpc-stubs)
for regenerating the Go stubs.

## Security Notes

- Secrets live only in each project's `.env` (never committed). Each project
  exposes an `.env.example` (API) or documents required variables.
- The web app only ever holds the Stripe **publishable** key; the secret key
  stays in `api/.env`.
- Rotate any credential that has been shared in plaintext, and add a
  `.gitignore` that excludes `.env` before initialising a repository in a
  project that lacks one.
# scalable-ecommerce-platform
