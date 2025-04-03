-- Add new integration types to the integration_type enum
ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'google-ads';
ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'facebook-ads';
ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'google-analytics';
ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'google-search-console';

-- Add credentials and settings columns to integration_settings table
ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS credentials JSONB;
ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS settings JSONB;

-- Create analytics_campaigns table
CREATE TABLE IF NOT EXISTS analytics_campaigns (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL,
  integration_id INT NOT NULL,
  campaign_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  budget DECIMAL(10, 2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE CASCADE
);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_analytics_campaigns_timestamp') THEN
    CREATE TRIGGER update_analytics_campaigns_timestamp
    BEFORE UPDATE ON analytics_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END
$$;

-- Create analytics_performance table
CREATE TABLE IF NOT EXISTS analytics_performance (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL,
  integration_id INT NOT NULL,
  campaign_id VARCHAR(255),
  date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  conversions INT DEFAULT 0,
  conversion_value DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE CASCADE
);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_analytics_performance_timestamp') THEN
    CREATE TRIGGER update_analytics_performance_timestamp
    BEFORE UPDATE ON analytics_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END
$$;

-- Create analytics_alerts table
CREATE TABLE IF NOT EXISTS analytics_alerts (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL,
  integration_id INT,
  name VARCHAR(255) NOT NULL,
  metric VARCHAR(50) NOT NULL,
  condition VARCHAR(20) NOT NULL,
  threshold DECIMAL(10, 2) NOT NULL,
  period VARCHAR(20) NOT NULL,
  notification_method VARCHAR(20) NOT NULL,
  recipients JSONB,
  is_enabled BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE SET NULL
);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_analytics_alerts_timestamp') THEN
    CREATE TRIGGER update_analytics_alerts_timestamp
    BEFORE UPDATE ON analytics_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END
$$;

-- Create analytics_sync_logs table
CREATE TABLE IF NOT EXISTS analytics_sync_logs (
  id SERIAL PRIMARY KEY,
  integration_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  records_processed INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE CASCADE
);
