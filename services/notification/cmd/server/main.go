package main

import (
	"context"
	"errors"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/rabbitmq/amqp091-go"
	"github.com/resend/resend-go/v4"

	"github.com/Yuossof/notification-service/internal/notification"
)

func main() {
	if err := godotenv.Load(); err != nil && !errors.Is(err, os.ErrNotExist) {
		log.Fatal(err)
	}

	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		log.Fatal("RABBITMQ_URL is required")
	}
	resendAPIKey := os.Getenv("RESEND_API_KEY")
	if resendAPIKey == "" {
		log.Fatal("RESEND_API_KEY is required")
	}

	conn, err := amqp091.Dial(rabbitMQURL)
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ:", err)
	}
	defer conn.Close()

	client := resend.NewClient(resendAPIKey)

	worker, err := notification.NewNotificationWorker(conn, client)
	if err != nil {
		log.Fatal("Failed to start notification worker:", err)
	}
	defer worker.Close()

	worker.StartWorker()
	log.Printf("Notification worker listening on queue %q", notification.QueueName)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	log.Println("Shutting down notification worker...")
}
