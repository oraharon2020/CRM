-- Add store_id column to integration_settings table
ALTER TABLE integration_settings 
ADD COLUMN IF NOT EXISTS store_id INT NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_integration_store' 
    AND table_name = 'integration_settings'
  ) THEN
    ALTER TABLE integration_settings
    ADD CONSTRAINT fk_integration_store 
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_integration_settings_store_id ON integration_settings(store_id);
