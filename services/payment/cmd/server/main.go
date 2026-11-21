package main

import (
	"context"
	"errors"
	"log"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	amqp "github.com/rabbitmq/amqp091-go"

	"github.com/Yuossof/payment-service/internal/config"
	"github.com/Yuossof/payment-service/internal/payment"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Invalid configuration: ", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to create database pool: ", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatal("Failed to connect to PostgreSQL: ", err)
	}

	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ: ", err)
	}
	defer conn.Close()

	notificationChannel, err := conn.Channel()
	if err != nil {
		log.Fatal("Failed to open notification publisher channel: ", err)
	}
	defer func() { _ = notificationChannel.Close() }()

	publisher, err := payment.NewAMQPNotificationPublisher(notificationChannel, cfg.NotificationQ)
	if err != nil {
		log.Fatal("Failed to start notification publisher: ", err)
	}

	repo := payment.NewPGRepository(pool)
	service := payment.NewService(repo, payment.NewStripeGateway(cfg.StripeSecretKey), publisher)

	processTimeout := time.Duration(cfg.ProcessTimeoutSeconds) * time.Second
	eventWorker := payment.NewEventWorker(conn, service, cfg.EventQueue, cfg.PrefetchCount, processTimeout)
	rpcServer := payment.NewCreatePaymentRPC(conn, service, cfg.CreateQueue, cfg.PrefetchCount, processTimeout)

	errCh := make(chan error, 2)
	go func() { errCh <- eventWorker.Run(ctx) }()
	go func() { errCh <- rpcServer.Run(ctx) }()

	log.Printf(
		"Payment service started (events=%q, create=%q, notifications=%q)",
		cfg.EventQueue, cfg.CreateQueue, cfg.NotificationQ,
	)

	select {
	case err := <-errCh:
		if err != nil && !errors.Is(err, context.Canceled) {
			log.Fatal("Payment worker stopped unexpectedly: ", err)
		}
	case <-ctx.Done():
		log.Println("Shutting down payment service...")
	}
}
