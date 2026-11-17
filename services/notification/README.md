# Notification Service

Go gRPC microservice that sends transactional email for the E-Commerce
platform. It is called by the [API](../api) over gRPC and delivers messages with
[Resend](https://resend.com).

## Relationship to the API

The notification service is a **downstream dependency of the API**, not of the
web client. The flow is:

```text
Stripe webhook ──▶ API (payments.service.ts)
                        │  gRPC SendNotification (user_id, title, body)
                        ▼
              Notification Service (:50051)
                        │  Resend Emails.Send
                        ▼
                    Customer inbox
```

- The API is the **gRPC client**. It loads the contract from
  `api/proto/notification.proto` and connects to `localhost:50051` in
  [`api/src/grpc/notifications/notification.client.ts`](../api/src/grpc/notifications/notification.client.ts)
  with a 5-second deadline.
- The API calls `notifyUser(...)` from
  [`api/src/modules/payment/payments.service.ts`](../api/src/modules/payment/payments.service.ts)
  after a payment status update (e.g. to send an "Order Confirmed" email).
- Notification failures are **best-effort**: the API logs the error and still
  returns a successful payment response, so email delivery never blocks an
  order. See `orders.service.test.ts` for the fallback behaviour.

Because the two projects share the same `.proto` contract, the file exists in
both repositories:

```text
api/proto/notification.proto
services/notification/proto/notification.proto
```

Keep them in sync when the contract changes.

## Technology Stack

- Go 1.27
- gRPC (`google.golang.org/grpc`) + Protocol Buffers
- Resend Go SDK (`github.com/resend/resend-go/v4`)
- `godotenv` for local environment loading

## Project Structure

```text
services/notification/
├── cmd/
│   └── server/
│       └── main.go                     # Entry point: loads .env, starts gRPC on :50051
├── internal/
│   └── notification/
│       └── server.go                   # NotificationService implementation + mail worker
├── proto/
│   └── notification.proto              # gRPC contract (mirror of api/proto)
├── gen/
│   └── notification/                   # Generated protobuf + gRPC stubs (do not edit)
├── go.mod
└── go.sum
```

## Proto Contract

Defined in [`proto/notification.proto`](./proto/notification.proto):

```proto
service NotificationService {
  rpc SendNotification (SendNotificationRequest)
      returns (SendNotificationResponse);
}

message SendNotificationRequest {
  string user_id = 1;
  string title = 2;
  string body = 3;
}

message SendNotificationResponse {
  bool success = 1;
  string message = 2;
}
```

`SendNotification` enqueues the message on a buffered channel (capacity 100) and
returns immediately; a background worker (`Loop`) consumes the channel and sends
the email, so gRPC callers are never blocked on the Resend API.

## Getting Started

Fetch dependencies:

```bash
go mod download
```

Create `.env` (see [Configuration](#configuration)):

```bash
RESEND_API_KEY=re_...
```

Run the server:

```bash
go run ./cmd/server
```

The server listens for gRPC on `:50051` and logs:

```text
gRPC server listening on :50051
```

The API connects to `localhost:50051`, so start this service before exercising
the payment/notification flow.

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Resend API key used to send emails. |

`godotenv` loads these from a local `.env` file. In production, inject them as
real environment variables.

## Regenerating the gRPC Stubs

The code in `gen/notification` is generated from `proto/notification.proto`.
After changing the contract, regenerate both this service and the API's copy:

```bash
protoc \
  --go_out=./gen --go_opt=paths=source_relative \
  --go-grpc_out=./gen --go-grpc_opt=paths=source_relative \
  --proto_path=./proto \
  proto/notification.proto
```

## Current Limitations

These are known rough edges in the current implementation, not intended
behaviour:

- The recipient address is hardcoded (`youssofwr@gmail.com`) instead of being
  resolved from `user_id`.
- The email subject/body are hardcoded ("Hello from Golang" /
  `<strong>hello world</strong>`); the `title` and `body` from the request are
  only logged.
- There is no `.gitignore`, so a local `.env` with a live `RESEND_API_KEY` can be
  committed by accident. Add a `.gitignore` that excludes `.env` before
  committing.
