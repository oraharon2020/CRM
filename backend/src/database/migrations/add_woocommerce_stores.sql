-- Migration to add WooCommerce stores table

-- First create the store_status enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_status') THEN
    CREATE TYPE store_status AS ENUM ('active', 'inactive');
  END IF;
END
$$;

-- Create WooCommerce stores table
CREATE TABLE IF NOT EXISTS woocommerce_stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  consumer_key VARCHAR(255) NOT NULL,
  consumer_secret VARCHAR(255) NOT NULL,
  status store_status NOT NULL DEFAULT 'active',
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_woocommerce_stores_timestamp') THEN
    CREATE TRIGGER update_woocommerce_stores_timestamp
    BEFORE UPDATE ON woocommerce_stores
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END
$$;

-- Insert sample data
INSERT INTO woocommerce_stores (name, url, consumer_key, consumer_secret, status)
VALUES 
  ('bellano', 'https://www.bellano.co.il', 'ck_bcf06dd966c850b80accd1004f2a2545443251c4', 'cs_cf3ea36e6b49cacfaa326ce96a803716f4c42c9f', 'active'),
  ('Nalla', 'https://www.nalla.co.il', 'ck_6991eeb4b3532be9db091ee32d19b0c0e7225b4f', 'cs_6349b5aa2214c738b064f54cb88e7eb2cb304cfb', 'active')
ON CONFLICT DO NOTHING;

-- Update the store model to use this table instead of the original stores table
