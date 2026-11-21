package payment

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository persists payment state and applies the effects of a successful
// payment (inventory decrement and order status update) atomically.
type Repository interface {
	CreatePayment(ctx context.Context, input NewPayment) (Payment, error)
	FindPendingPayment(ctx context.Context, orderID string) (*Payment, error)
	FindUserEmail(ctx context.Context, userID string) (string, error)
	ApplyPaymentStatus(ctx context.Context, status, orderID string) (bool, error)
}

// PGRepository is a PostgreSQL implementation of Repository.
type PGRepository struct {
	pool *pgxpool.Pool
}

func NewPGRepository(pool *pgxpool.Pool) *PGRepository {
	return &PGRepository{pool: pool}
}

const paymentColumns = `
	id::text, order_id::text, provider, COALESCE(transaction_id, ''),
	amount::text, status
`

func scanPayment(row pgx.Row) (Payment, error) {
	var (
		payment Payment
		amount  string
	)
	if err := row.Scan(
		&payment.ID,
		&payment.OrderID,
		&payment.Provider,
		&payment.TransactionID,
		&amount,
		&payment.Status,
	); err != nil {
		return Payment{}, err
	}

	parsed, err := strconv.ParseFloat(amount, 64)
	if err != nil {
		return Payment{}, fmt.Errorf("parse payment amount %q: %w", amount, err)
	}
	payment.Amount = parsed
	return payment, nil
}

func (r *PGRepository) CreatePayment(ctx context.Context, input NewPayment) (Payment, error) {
	const query = `
		INSERT INTO payments (order_id, provider, transaction_id, amount, status)
		VALUES ($1, $2, $3, CAST($4 AS NUMERIC), $5)
		RETURNING ` + paymentColumns

	return scanPayment(r.pool.QueryRow(ctx, query,
		input.OrderID,
		input.Provider,
		input.TransactionID,
		strconv.FormatFloat(input.Amount, 'f', 2, 64),
		input.Status,
	))
}

func (r *PGRepository) FindPendingPayment(ctx context.Context, orderID string) (*Payment, error) {
	const query = `
		SELECT ` + paymentColumns + `
		FROM payments
		WHERE order_id = $1 AND status = $2
		ORDER BY created_at DESC
		LIMIT 1
	`

	payment, err := scanPayment(r.pool.QueryRow(ctx, query, orderID, StatusPending))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

func (r *PGRepository) FindUserEmail(ctx context.Context, userID string) (string, error) {
	var email string
	err := r.pool.QueryRow(ctx, `SELECT email FROM users WHERE id = $1`, userID).Scan(&email)
	if err != nil {
		return "", fmt.Errorf("find user %s: %w", userID, err)
	}
	return email, nil
}

// ApplyPaymentStatus updates the payment and order statuses. On "success" it
// also decrements stock for every SKU in the order. All changes happens in a
// single transaction so a stock failure rolls the status updates back.
// The returned boolean reports whether the status actually changed, which
// makes repeated webhook deliveries idempotent.
func (r *PGRepository) ApplyPaymentStatus(ctx context.Context, status, orderID string) (bool, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return false, fmt.Errorf("begin payment transaction: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	result, err := tx.Exec(ctx, `
		UPDATE payments
		SET status = $1, updated_at = NOW()
		WHERE order_id = $2 AND status <> $1
	`, status, orderID)
	if err != nil {
		return false, fmt.Errorf("update payment status: %w", err)
	}
	if result.RowsAffected() == 0 {
		// Already processed this status: nothing else to do.
		if err := tx.Commit(ctx); err != nil {
			return false, fmt.Errorf("commit idempotent payment update: %w", err)
		}
		return false, nil
	}

	if status == StatusSuccess {
		if err := decrementInventory(ctx, tx, orderID); err != nil {
			return false, err
		}
	}

	result, err = tx.Exec(ctx, `
		UPDATE orders
		SET payment_status = $1, updated_at = NOW()
		WHERE id = $2
	`, status, orderID)
	if err != nil {
		return false, fmt.Errorf("update order payment status: %w", err)
	}
	if result.RowsAffected() == 0 {
		return false, fmt.Errorf("order %s not found", orderID)
	}

	if err := tx.Commit(ctx); err != nil {
		return false, fmt.Errorf("commit payment status: %w", err)
	}
	return true, nil
}

// decrementInventory aggregates the items by SKU and subtracts the reserved
// quantity in one statement. The quantity guard prevents negative stock; the
// affected-row count tells us whether every SKU had enough stock.
func decrementInventory(ctx context.Context, tx pgx.Tx, orderID string) error {
	rows, err := tx.Query(ctx, `
		SELECT products_sku_id::text, quantity
		FROM order_items
		WHERE order_id = $1
	`, orderID)
	if err != nil {
		return fmt.Errorf("load order items: %w", err)
	}
	defer rows.Close()

	quantities := make(map[string]int)
	for rows.Next() {
		var (
			skuID    string
			quantity int
		)
		if err := rows.Scan(&skuID, &quantity); err != nil {
			return fmt.Errorf("scan order item: %w", err)
		}
		quantities[skuID] += quantity
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("read order items: %w", err)
	}
	if len(quantities) == 0 {
		return fmt.Errorf("no order items found for order %s", orderID)
	}

	skuIDs := make([]string, 0, len(quantities))
	amounts := make([]int, 0, len(quantities))
	for skuID, quantity := range quantities {
		skuIDs = append(skuIDs, skuID)
		amounts = append(amounts, quantity)
	}

	result, err := tx.Exec(ctx, `
		UPDATE products_skus AS ps
		SET quantity = ps.quantity - reserved.quantity, updated_at = NOW()
		FROM unnest($1::uuid[], $2::int[]) AS reserved(sku_id, quantity)
		WHERE ps.id = reserved.sku_id AND ps.quantity >= reserved.quantity
	`, skuIDs, amounts)
	if err != nil {
		return fmt.Errorf("decrement inventory: %w", err)
	}
	if int(result.RowsAffected()) != len(quantities) {
		return fmt.Errorf(
			"insufficient stock for order %s: updated %d of %d SKUs",
			orderID, result.RowsAffected(), len(quantities),
		)
	}
	return nil
}
