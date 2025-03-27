import { pool } from '../config/database';

export interface AnalyticsAlert {
  id?: number;
  store_id: number;
  integration_id?: number;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  period: string;
  notification_method: string;
  recipients?: any;
  is_enabled: boolean;
  last_triggered?: Date;
  created_at?: Date;
  updated_at?: Date;
}

class AnalyticsAlertModel {
  /**
   * Create the analytics_alerts table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
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
        
        CREATE INDEX IF NOT EXISTS idx_analytics_alerts_store_id ON analytics_alerts(store_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_alerts_integration_id ON analytics_alerts(integration_id);
      `);
      console.log('Analytics alerts table created or already exists');
    } catch (error) {
      console.error('Error creating analytics alerts table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all alerts with optional filtering
   */
  async getAll(filters: { store_id?: number; is_enabled?: boolean }): Promise<AnalyticsAlert[]> {
    const client = await pool.connect();
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build the WHERE clause dynamically based on provided filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          conditions.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const query = `
        SELECT * FROM analytics_alerts
        ${whereClause}
        ORDER BY name ASC
      `;
      
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting alerts with filters:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all alerts for a store
   */
  async getByStoreId(storeId: number, isEnabled?: boolean): Promise<AnalyticsAlert[]> {
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM analytics_alerts WHERE store_id = $1';
      const params: any[] = [storeId];
      
      if (isEnabled !== undefined) {
        query += ' AND is_enabled = $2';
        params.push(isEnabled);
      }
      
      query += ' ORDER BY name ASC';
      
      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting alerts by store ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get an alert by its ID
   */
  async getById(id: number): Promise<AnalyticsAlert | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM analytics_alerts WHERE id = $1',
        [id]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting alert by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a new alert
   */
  async create(alert: AnalyticsAlert): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO analytics_alerts 
         (store_id, integration_id, name, metric, condition, threshold, period, notification_method, recipients, is_enabled) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [
          alert.store_id,
          alert.integration_id,
          alert.name,
          alert.metric,
          alert.condition,
          alert.threshold,
          alert.period,
          alert.notification_method,
          alert.recipients ? JSON.stringify(alert.recipients) : null,
          alert.is_enabled
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing alert
   */
  async update(id: number, alert: Partial<AnalyticsAlert>): Promise<boolean> {
    const client = await pool.connect();
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build the SET clause dynamically based on provided fields
      for (const [key, value] of Object.entries(alert)) {
        if (key !== 'id' && key !== 'created_at') {
          if (key === 'recipients' && value !== undefined) {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(JSON.stringify(value));
            paramIndex++;
          } else {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        }
      }
      
      // Add updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Add the ID as the last parameter
      values.push(id);
      
      const result = await client.query(
        `UPDATE analytics_alerts 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex}`,
        values
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete an alert
   */
  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM analytics_alerts WHERE id = $1',
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete all alerts for a store
   */
  async deleteByStoreId(storeId: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM analytics_alerts WHERE store_id = $1',
        [storeId]
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting alerts by store ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update the last triggered timestamp for an alert
   */
  async updateLastTriggered(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE analytics_alerts 
         SET last_triggered = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating alert last triggered:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all alerts that need to be checked
   */
  async getAlertsToCheck(): Promise<AnalyticsAlert[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM analytics_alerts 
        WHERE is_enabled = true 
        ORDER BY store_id, name
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting alerts to check:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Enable or disable an alert
   */
  async setEnabled(id: number, isEnabled: boolean): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE analytics_alerts 
         SET is_enabled = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [isEnabled, id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error setting alert enabled status:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const analyticsAlertModel = new AnalyticsAlertModel();
