// Package config loads the payment service configuration from the environment.
package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

const (
	defaultDatabasePort   = "5432"
	defaultEventQueue     = "payment_queue"
	defaultCreateQueue    = "payment.create"
	defaultNotificationQ  = "notifications"
	defaultPrefetchCount  = 3
	defaultProcessTimeout = 10
)

// Config holds everything the payment service needs at runtime.
type Config struct {
	DatabaseURL           string
	RabbitMQURL           string
	StripeSecretKey       string
	EventQueue            string
	CreateQueue           string
	NotificationQ         string
	PrefetchCount         int
	ProcessTimeoutSeconds int
}

// Load reads configuration from the environment (and a local .env file when
// present) and validates the required values.
func Load() (Config, error) {
	// A missing .env file is fine: containers inject real environment variables.
	_ = godotenv.Load()

	cfg := Config{
		DatabaseURL:           os.Getenv("DATABASE_URL"),
		RabbitMQURL:           strings.TrimSpace(os.Getenv("RABBITMQ_URL")),
		StripeSecretKey:       strings.TrimSpace(os.Getenv("STRIPE_SECRET_KEY")),
		EventQueue:            envOrDefault("PAYMENT_EVENT_QUEUE", defaultEventQueue),
		CreateQueue:           envOrDefault("PAYMENT_CREATE_QUEUE", defaultCreateQueue),
		NotificationQ:         envOrDefault("NOTIFICATION_QUEUE", defaultNotificationQ),
		PrefetchCount:         envIntOrDefault("PAYMENT_PREFETCH", defaultPrefetchCount),
		ProcessTimeoutSeconds: envIntOrDefault("PAYMENT_PROCESS_TIMEOUT_SECONDS", defaultProcessTimeout),
	}

	if cfg.DatabaseURL == "" {
		host := envOrDefault("DB_HOST", "localhost")
		port := envOrDefault("DB_PORT", defaultDatabasePort)
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		name := envOrDefault("DB_NAME", "ecommercedb_v2")
		sslMode := envOrDefault("DB_SSLMODE", "disable")

		if user == "" {
			return Config{}, fmt.Errorf("DB_USER (or DATABASE_URL) is required")
		}

		cfg.DatabaseURL = (&url.URL{
			Scheme: "postgres",
			User:   url.UserPassword(user, password),
			Host:   fmt.Sprintf("%s:%s", host, port),
			Path:   "/" + name,
			RawQuery: url.Values{
				"sslmode": []string{sslMode},
			}.Encode(),
		}).String()
	}

	if cfg.RabbitMQURL == "" {
		return Config{}, fmt.Errorf("RABBITMQ_URL is required")
	}
	if cfg.StripeSecretKey == "" {
		return Config{}, fmt.Errorf("STRIPE_SECRET_KEY is required")
	}
	if cfg.PrefetchCount < 1 {
		return Config{}, fmt.Errorf("PAYMENT_PREFETCH must be at least 1")
	}

	return cfg, nil
}

func envOrDefault(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func envIntOrDefault(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 {
		return fallback
	}
	return parsed
}
