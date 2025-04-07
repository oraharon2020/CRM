-- Add credentials and settings columns to integration_settings table
ALTER TABLE integration_settings 
ADD COLUMN IF NOT EXISTS credentials JSONB NULL,
ADD COLUMN IF NOT EXISTS settings JSONB NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integration_settings_credentials ON integration_settings USING gin(credentials);
CREATE INDEX IF NOT EXISTS idx_integration_settings_settings ON integration_settings USING gin(settings);
