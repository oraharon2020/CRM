-- First drop the existing foreign key constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS fk_leads_store;

-- Add a new foreign key constraint to woocommerce_stores table
ALTER TABLE leads 
ADD CONSTRAINT fk_leads_woocommerce_store 
FOREIGN KEY (store_id) REFERENCES woocommerce_stores(id) ON DELETE SET NULL;

-- Update the index for faster queries
DROP INDEX IF EXISTS idx_leads_store_id;
CREATE INDEX idx_leads_woocommerce_store_id ON leads(store_id);
