import { pool, formatQuery } from '../config/database';
import crypto from 'crypto';

export interface AnalyticsIntegrationSettings {
  id?: number;
  store_id: number;
  name: string;
  type: 'google-ads' | 'facebook-ads' | 'google-analytics' | 'google-search-console';
  credentials: Record<string, any>;
  settings?: Record<string, any>;
  is_enabled: boolean;
  last_sync?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsSyncLog {
  id?: number;
  integration_id: number;
  status: 'pending' | 'completed' | 'failed';
  start_time: string;
  end_time?: string;
  records_processed?: number;
  error_message?: string;
  created_at?: string;
}

class AnalyticsIntegrationSettingsModel {
  /**
   * Get all analytics integration settings
   */
  async getAll(storeId?: number): Promise<AnalyticsIntegrationSettings[]> {
    try {
      let query = `
        SELECT * FROM analytics_integration_settings
      `;
      
      const params: any[] = [];
      
      if (storeId) {
        query += ' WHERE store_id = $1';
        params.push(storeId);
      }
      
      query += ' ORDER BY name ASC';
      
      const result = await pool.query(query, params);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting analytics integration settings:', error);
      throw error;
    }
  }

  /**
   * Get analytics integration settings by ID
   */
  async getById(id: number): Promise<AnalyticsIntegrationSettings | null> {
    try {
      const query = 'SELECT * FROM analytics_integration_settings WHERE id = $1';
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting analytics integration settings with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new analytics integration setting
   */
  async create(integration: AnalyticsIntegrationSettings): Promise<number> {
    try {
      const query = `
        INSERT INTO analytics_integration_settings (
          store_id,
          name,
          type,
          credentials,
          settings,
          is_enabled
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        integration.store_id,
        integration.name,
        integration.type,
        JSON.stringify(integration.credentials),
        integration.settings ? JSON.stringify(integration.settings) : null,
        integration.is_enabled
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating analytics integration settings:', error);
      throw error;
    }
  }

  /**
   * Update an existing analytics integration setting
   */
  async update(id: number, integration: Partial<AnalyticsIntegrationSettings>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (integration.store_id !== undefined) {
        fields.push(`store_id = $${paramIndex++}`);
        values.push(integration.store_id);
      }
      
      if (integration.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(integration.name);
      }
      
      if (integration.type !== undefined) {
        fields.push(`type = $${paramIndex++}`);
        values.push(integration.type);
      }
      
      if (integration.credentials !== undefined) {
        fields.push(`credentials = $${paramIndex++}`);
        values.push(JSON.stringify(integration.credentials));
      }
      
      if (integration.settings !== undefined) {
        fields.push(`settings = $${paramIndex++}`);
        values.push(integration.settings ? JSON.stringify(integration.settings) : null);
      }
      
      if (integration.is_enabled !== undefined) {
        fields.push(`is_enabled = $${paramIndex++}`);
        values.push(integration.is_enabled);
      }
      
      if (integration.last_sync !== undefined) {
        fields.push(`last_sync = $${paramIndex++}`);
        values.push(integration.last_sync);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      const query = `UPDATE analytics_integration_settings SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);
      
      const result = await pool.query(query, values);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating analytics integration settings with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an analytics integration setting
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM analytics_integration_settings WHERE id = $1';
      
      const result = await pool.query(query, [id]);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting analytics integration settings with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a sync log entry
   */
  async createSyncLog(syncLog: AnalyticsSyncLog): Promise<number> {
    try {
      const query = `
        INSERT INTO analytics_sync_logs (
          integration_id,
          status,
          start_time,
          end_time,
          records_processed,
          error_message
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        syncLog.integration_id,
        syncLog.status,
        syncLog.start_time,
        syncLog.end_time || null,
        syncLog.records_processed || 0,
        syncLog.error_message || null
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating analytics sync log:', error);
      throw error;
    }
  }

  /**
   * Update a sync log entry
   */
  async updateSyncLog(id: number, syncLog: Partial<AnalyticsSyncLog>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (syncLog.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(syncLog.status);
      }
      
      if (syncLog.end_time !== undefined) {
        fields.push(`end_time = $${paramIndex++}`);
        values.push(syncLog.end_time);
      }
      
      if (syncLog.records_processed !== undefined) {
        fields.push(`records_processed = $${paramIndex++}`);
        values.push(syncLog.records_processed);
      }
      
      if (syncLog.error_message !== undefined) {
        fields.push(`error_message = $${paramIndex++}`);
        values.push(syncLog.error_message);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      const query = `UPDATE analytics_sync_logs SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);
      
      const result = await pool.query(query, values);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating analytics sync log with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the latest sync log for an integration
   */
  async getLatestSyncLog(integrationId: number): Promise<AnalyticsSyncLog | null> {
    try {
      const query = `
        SELECT * FROM analytics_sync_logs
        WHERE integration_id = $1
        ORDER BY start_time DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [integrationId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting latest sync log for integration ${integrationId}:`, error);
      throw error;
    }
  }

  /**
   * Get sync logs for an integration
   */
  async getSyncLogs(integrationId: number, limit: number = 10): Promise<AnalyticsSyncLog[]> {
    try {
      const query = `
        SELECT * FROM analytics_sync_logs
        WHERE integration_id = $1
        ORDER BY start_time DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [integrationId, limit]);
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting sync logs for integration ${integrationId}:`, error);
      throw error;
    }
  }
}

export const analyticsIntegrationSettingsModel = new AnalyticsIntegrationSettingsModel();
