-- Migration to add analytics tables

-- Table for analytics campaigns
CREATE TABLE IF NOT EXISTS analytics_campaigns (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    campaign_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    budget DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, campaign_id),
    FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Table for analytics performance data
CREATE TABLE IF NOT EXISTS analytics_performance (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    campaign_id VARCHAR(255),
    date DATE NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    conversion_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, campaign_id, date),
    FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Table for analytics alerts
CREATE TABLE IF NOT EXISTS analytics_alerts (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL,
    integration_id INTEGER,
    name VARCHAR(255) NOT NULL,
    metric VARCHAR(50) NOT NULL,
    condition VARCHAR(20) NOT NULL,
    threshold DECIMAL(10, 2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    notification_method VARCHAR(20) NOT NULL,
    recipients JSONB,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE SET NULL
);

-- Table for analytics sync logs
CREATE TABLE IF NOT EXISTS analytics_sync_logs (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    records_processed INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_campaigns_integration_id ON analytics_campaigns(integration_id);
CREATE INDEX IF NOT EXISTS idx_analytics_campaigns_store_id ON analytics_campaigns(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_campaigns_campaign_id ON analytics_campaigns(campaign_id);

CREATE INDEX IF NOT EXISTS idx_analytics_performance_integration_id ON analytics_performance(integration_id);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_store_id ON analytics_performance(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_campaign_id ON analytics_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_date ON analytics_performance(date);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_store_id ON analytics_alerts(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_integration_id ON analytics_alerts(integration_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sync_logs_integration_id ON analytics_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sync_logs_status ON analytics_sync_logs(status);
