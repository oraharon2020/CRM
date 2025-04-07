-- Add default_store_id column to users table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'default_store_id'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE users ADD COLUMN default_store_id INTEGER;
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_users_default_store' AND table_name = 'users'
    ) THEN
        -- Add the constraint if it doesn't exist
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_default_store 
        FOREIGN KEY (default_store_id) 
        REFERENCES stores(id) 
        ON DELETE SET NULL;
    END IF;
END
$$;
