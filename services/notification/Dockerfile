FROM golang:1.27 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY proto ./proto
COPY internal ./internal
COPY gen ./gen
COPY cmd ./cmd

RUN CGO_ENABLED=0 go build -o /bin/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /bin/server /server
EXPOSE 50051
ENTRYPOINT ["/server"]