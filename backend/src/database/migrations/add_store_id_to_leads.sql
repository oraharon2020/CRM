-- Add store_id column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS store_id INT;

-- Add foreign key constraint
ALTER TABLE leads 
ADD CONSTRAINT fk_leads_store 
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_store_id ON leads(store_id);
