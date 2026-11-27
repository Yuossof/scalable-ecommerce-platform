DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'image'
    ) THEN
        ALTER TABLE categories ADD COLUMN image TEXT;
    END IF;
END $$;
