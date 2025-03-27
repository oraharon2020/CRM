-- Add analytics integration settings table
CREATE TABLE IF NOT EXISTS analytics_integration_settings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- google-ads, facebook-ads, google-analytics, google-search-console
  credentials JSONB NOT NULL, -- API credentials (tokens, client IDs, etc.)
  settings JSONB, -- Integration-specific settings
  is_enabled BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups by store
CREATE INDEX IF NOT EXISTS idx_analytics_integration_store ON analytics_integration_settings(store_id);

-- Add analytics sync logs table
CREATE TABLE IF NOT EXISTS analytics_sync_logs (
  id SERIAL PRIMARY KEY,
  integration_id INTEGER NOT NULL REFERENCES analytics_integration_settings(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- pending, completed, failed
  start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups by integration
CREATE INDEX IF NOT EXISTS idx_analytics_sync_logs_integration ON analytics_sync_logs(integration_id);

-- Add analytics campaign data table
CREATE TABLE IF NOT EXISTS analytics_campaigns (
  id SERIAL PRIMARY KEY,
  integration_id INTEGER NOT NULL REFERENCES analytics_integration_settings(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL, -- ID from external system (Google, Facebook, etc.)
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- ENABLED, PAUSED, REMOVED, etc.
  platform VARCHAR(50) NOT NULL, -- google-ads, facebook-ads, etc.
  budget DECIMAL(12, 2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(integration_id, external_id)
);

-- Add analytics performance data table
CREATE TABLE IF NOT EXISTS analytics_performance (
  id SERIAL PRIMARY KEY,
  integration_id INTEGER NOT NULL REFERENCES analytics_integration_settings(id) ON DELETE CASCADE,
  campaign_id INTEGER REFERENCES analytics_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(12, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups by date range
CREATE INDEX IF NOT EXISTS idx_analytics_performance_date ON analytics_performance(integration_id, date);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics_integration_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_analytics_integration_settings_timestamp'
  ) THEN
    CREATE TRIGGER update_analytics_integration_settings_timestamp
    BEFORE UPDATE ON analytics_integration_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- Create trigger for analytics_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_analytics_campaigns_timestamp'
  ) THEN
    CREATE TRIGGER update_analytics_campaigns_timestamp
    BEFORE UPDATE ON analytics_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- Create trigger for analytics_performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_analytics_performance_timestamp'
  ) THEN
    CREATE TRIGGER update_analytics_performance_timestamp
    BEFORE UPDATE ON analytics_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;
