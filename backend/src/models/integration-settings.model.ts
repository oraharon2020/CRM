import { pool, formatQuery } from '../config/database';
import crypto from 'crypto';

export interface IntegrationSettings {
  id?: number;
  name: string;
  type: 'elementor' | 'contact-form-7' | 'facebook' | 'custom' | 'generic' | 
        'google-ads' | 'facebook-ads' | 'google-analytics' | 'google-search-console' |
        'multi-supplier-manager';
  api_key: string;
  is_enabled: boolean;
  store_id?: number | null; // Store ID for store-specific integrations, null for global
  credentials?: Record<string, string>; // For storing API credentials
  settings?: Record<string, any>; // For integration-specific settings
  field_mapping?: Record<string, string>;
  default_assignee?: number;
  webhook_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WebhookLog {
  id?: number;
  integration_id: number;
  request_id: string;
  source: string;
  payload: string;
  ip_address: string;
  user_agent: string;
  lead_id?: number;
  status?: 'success' | 'error';
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

class IntegrationSettingsModel {
  /**
   * Create integration_settings table if it doesn't exist
   */
  async createTables(): Promise<void> {
    // Create integration_type enum if it doesn't exist
    const createIntegrationTypeEnumQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_type') THEN
          CREATE TYPE integration_type AS ENUM (
            'elementor', 'contact-form-7', 'facebook', 'custom', 'generic',
            'google-ads', 'facebook-ads', 'google-analytics', 'google-search-console',
            'multi-supplier-manager'
          );
        END IF;
      END
      $$;
    `;

    // Create webhook_status enum if it doesn't exist
    const createWebhookStatusEnumQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'webhook_status') THEN
          CREATE TYPE webhook_status AS ENUM ('success', 'error');
        END IF;
      END
      $$;
    `;

    const integrationSettingsQuery = `
      CREATE TABLE IF NOT EXISTS integration_settings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type integration_type NOT NULL DEFAULT 'generic',
        api_key VARCHAR(64) NOT NULL UNIQUE,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        store_id INT,
        credentials JSONB,
        settings JSONB,
        field_mapping JSONB,
        default_assignee INT,
        webhook_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (default_assignee) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (store_id) REFERENCES woocommerce_stores(id) ON DELETE SET NULL
      );
    `;

    const integrationSettingsTriggerQuery = `
      -- Create trigger for updated_at if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_integration_settings_timestamp') THEN
          CREATE TRIGGER update_integration_settings_timestamp
          BEFORE UPDATE ON integration_settings
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        END IF;
      END
      $$;
    `;

    const webhookLogQuery = `
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        integration_id INT NOT NULL,
        request_id VARCHAR(36) NOT NULL UNIQUE,
        source VARCHAR(255) NOT NULL,
        payload TEXT,
        ip_address VARCHAR(45),
        user_agent VARCHAR(255),
        lead_id INT,
        status webhook_status DEFAULT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (integration_id) REFERENCES integration_settings(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
      );
    `;

    const webhookLogTriggerQuery = `
      -- Create trigger for updated_at if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_webhook_logs_timestamp') THEN
          CREATE TRIGGER update_webhook_logs_timestamp
          BEFORE UPDATE ON webhook_logs
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        END IF;
      END
      $$;
    `;

    try {
      // Create enum types
      await pool.query(createIntegrationTypeEnumQuery);
      await pool.query(createWebhookStatusEnumQuery);
      
      // Create tables
      await pool.query(integrationSettingsQuery);
      console.log('Integration settings table created or already exists');
      
      // Create integration settings trigger
      try {
        await pool.query(integrationSettingsTriggerQuery);
      } catch (triggerError) {
        console.error('Error creating integration settings trigger (non-critical):', triggerError);
        // Continue even if trigger creation fails
      }
      
      // Create webhook logs table
      await pool.query(webhookLogQuery);
      console.log('Webhook logs table created or already exists');
      
      // Create webhook logs trigger
      try {
        await pool.query(webhookLogTriggerQuery);
      } catch (triggerError) {
        console.error('Error creating webhook logs trigger (non-critical):', triggerError);
        // Continue even if trigger creation fails
      }
    } catch (error) {
      console.error('Error creating integration tables:', error);
      throw error;
    }
  }

  /**
   * Get all integration settings
   */
  async getAll(): Promise<IntegrationSettings[]> {
    try {
      const query = `
        SELECT i.*, u.name as assignee_name
        FROM integration_settings i
        LEFT JOIN users u ON i.default_assignee = u.id
        ORDER BY i.name ASC
      `;
      
      const result = await pool.query(query);
      
      return result.rows.map((row: any) => ({
        ...row,
        field_mapping: row.field_mapping || undefined
      })) as IntegrationSettings[];
    } catch (error) {
      console.error('Error getting integration settings:', error);
      throw error;
    }
  }

  /**
   * Get integration settings by ID
   */
  async getById(id: number): Promise<IntegrationSettings | null> {
    try {
      const query = `
        SELECT i.*, u.name as assignee_name
        FROM integration_settings i
        LEFT JOIN users u ON i.default_assignee = u.id
        WHERE i.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row: any = result.rows[0];
      
      return {
        ...row,
        field_mapping: row.field_mapping || undefined
      } as IntegrationSettings;
    } catch (error) {
      console.error(`Error getting integration settings with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get integration settings by API key
   */
  async getByApiKey(apiKey: string): Promise<IntegrationSettings | null> {
    try {
      const query = `
        SELECT i.*, u.name as assignee_name
        FROM integration_settings i
        LEFT JOIN users u ON i.default_assignee = u.id
        WHERE i.api_key = $1
      `;
      
      const result = await pool.query(query, [apiKey]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row: any = result.rows[0];
      
      return {
        ...row,
        field_mapping: row.field_mapping || undefined
      } as IntegrationSettings;
    } catch (error) {
      console.error(`Error getting integration settings with API key ${apiKey}:`, error);
      throw error;
    }
  }

  /**
   * Create a new integration setting
   */
  async create(integration: IntegrationSettings): Promise<number> {
    try {
      // Generate API key if not provided
      if (!integration.api_key) {
        integration.api_key = crypto.randomBytes(32).toString('hex');
      }
      
      const query = `
        INSERT INTO integration_settings (
          name, 
          type, 
          api_key, 
          is_enabled, 
          store_id,
          credentials,
          settings,
          field_mapping, 
          default_assignee,
          webhook_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        integration.name,
        integration.type,
        integration.api_key,
        integration.is_enabled,
        integration.store_id || null,
        integration.credentials ? JSON.stringify(integration.credentials) : null,
        integration.settings ? JSON.stringify(integration.settings) : null,
        integration.field_mapping ? JSON.stringify(integration.field_mapping) : null,
        integration.default_assignee || null,
        integration.webhook_url || null
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating integration settings:', error);
      throw error;
    }
  }

  /**
   * Update an existing integration setting
   */
  async update(id: number, integration: Partial<IntegrationSettings>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (integration.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(integration.name);
      }
      
      if (integration.type !== undefined) {
        fields.push(`type = $${paramIndex++}`);
        values.push(integration.type);
      }
      
      if (integration.api_key !== undefined) {
        fields.push(`api_key = $${paramIndex++}`);
        values.push(integration.api_key);
      }
      
      if (integration.is_enabled !== undefined) {
        fields.push(`is_enabled = $${paramIndex++}`);
        values.push(integration.is_enabled);
      }
      
      if (integration.credentials !== undefined) {
        fields.push(`credentials = $${paramIndex++}`);
        values.push(JSON.stringify(integration.credentials));
      }
      
      if (integration.settings !== undefined) {
        fields.push(`settings = $${paramIndex++}`);
        values.push(JSON.stringify(integration.settings));
      }
      
      if (integration.field_mapping !== undefined) {
        fields.push(`field_mapping = $${paramIndex++}`);
        values.push(JSON.stringify(integration.field_mapping));
      }
      
      if (integration.default_assignee !== undefined) {
        fields.push(`default_assignee = $${paramIndex++}`);
        values.push(integration.default_assignee);
      }
      
      if (integration.webhook_url !== undefined) {
        fields.push(`webhook_url = $${paramIndex++}`);
        values.push(integration.webhook_url);
      }
      
      if (integration.store_id !== undefined) {
        fields.push(`store_id = $${paramIndex++}`);
        values.push(integration.store_id);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      const query = `UPDATE integration_settings SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);
      
      const result = await pool.query(query, values);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating integration settings with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an integration setting
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM integration_settings WHERE id = $1';
      
      const result = await pool.query(query, [id]);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting integration settings with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Regenerate API key for an integration
   */
  async regenerateApiKey(id: number): Promise<string> {
    try {
      const newApiKey = crypto.randomBytes(32).toString('hex');
      
      const query = 'UPDATE integration_settings SET api_key = $1 WHERE id = $2';
      
      const result = await pool.query(query, [newApiKey, id]);
      
      if (result.rowCount === 0) {
        throw new Error(`Integration with ID ${id} not found`);
      }
      
      return newApiKey;
    } catch (error) {
      console.error(`Error regenerating API key for integration with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Log a webhook request
   */
  async logWebhookRequest(log: WebhookLog): Promise<number> {
    try {
      const query = `
        INSERT INTO webhook_logs (
          integration_id,
          request_id,
          source,
          payload,
          ip_address,
          user_agent,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        log.integration_id,
        log.request_id,
        log.source,
        log.payload,
        log.ip_address,
        log.user_agent,
        log.created_at
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error logging webhook request:', error);
      throw error;
    }
  }

  /**
   * Update a webhook log
   */
  async updateWebhookLog(requestId: string, update: { lead_id?: number; status?: 'success' | 'error'; error_message?: string }): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (update.lead_id !== undefined) {
        fields.push(`lead_id = $${paramIndex++}`);
        values.push(update.lead_id);
      }
      
      if (update.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(update.status);
      }
      
      if (update.error_message !== undefined) {
        fields.push(`error_message = $${paramIndex++}`);
        values.push(update.error_message);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      const query = `UPDATE webhook_logs SET ${fields.join(', ')} WHERE request_id = $${paramIndex}`;
      values.push(requestId);
      
      const result = await pool.query(query, values);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating webhook log with request ID ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Get webhook logs for an integration
   */
  async getWebhookLogs(integrationId: number, limit: number = 100): Promise<WebhookLog[]> {
    try {
      const query = `
        SELECT wl.*, l.name as lead_name
        FROM webhook_logs wl
        LEFT JOIN leads l ON wl.lead_id = l.id
        WHERE wl.integration_id = $1
        ORDER BY wl.created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [integrationId, limit]);
      
      return result.rows as WebhookLog[];
    } catch (error) {
      console.error(`Error getting webhook logs for integration with ID ${integrationId}:`, error);
      throw error;
    }
  }

  /**
   * Get webhook log by request ID
   */
  async getWebhookLogByRequestId(requestId: string): Promise<WebhookLog | null> {
    try {
      const query = `
        SELECT wl.*, l.name as lead_name
        FROM webhook_logs wl
        LEFT JOIN leads l ON wl.lead_id = l.id
        WHERE wl.request_id = $1
      `;
      
      const result = await pool.query(query, [requestId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as WebhookLog;
    } catch (error) {
      console.error(`Error getting webhook log with request ID ${requestId}:`, error);
      throw error;
    }
  }
}

export const integrationSettingsModel = new IntegrationSettingsModel();
