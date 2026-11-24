-- Merchandising fields used by the homepage product sections.
-- Every migration is re-runnable, so column existence is checked explicitly.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products_skus' AND column_name = 'compare_at_price'
    ) THEN
        ALTER TABLE products_skus ADD COLUMN compare_at_price DECIMAL(10, 2)
            CHECK (compare_at_price IS NULL OR compare_at_price >= 0);
    END IF;
END $$;
