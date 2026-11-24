-- Records which coupon (if any) was applied when the order was created.
-- The monetary discount is already stored in orders.discount.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'coupon_code'
    ) THEN
        ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50);
    END IF;
END $$;
