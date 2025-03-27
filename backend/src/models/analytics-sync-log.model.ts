import { pool } from '../config/database';

export interface AnalyticsSyncLog {
  id?: number;
  integration_id: number;
  status: 'pending' | 'completed' | 'failed';
  start_time: Date;
  end_time?: Date;
  records_processed?: number;
  error_message?: string;
  created_at?: Date;
}

class AnalyticsSyncLogModel {
  /**
   * Create the analytics_sync_logs table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
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
        
        CREATE INDEX IF NOT EXISTS idx_analytics_sync_logs_integration_id ON analytics_sync_logs(integration_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_sync_logs_status ON analytics_sync_logs(status);
      `);
      console.log('Analytics sync logs table created or already exists');
    } catch (error) {
      console.error('Error creating analytics sync logs table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all sync logs with optional filtering
   */
  async getAll(filters: { integration_id?: number; status?: string; limit?: number }): Promise<AnalyticsSyncLog[]> {
    const client = await pool.connect();
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build the WHERE clause dynamically based on provided filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && key !== 'limit') {
          conditions.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limitClause = filters.limit ? `LIMIT ${filters.limit}` : '';
      
      const query = `
        SELECT * FROM analytics_sync_logs
        ${whereClause}
        ORDER BY start_time DESC
        ${limitClause}
      `;
      
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting sync logs with filters:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a sync log by its ID
   */
  async getById(id: number): Promise<AnalyticsSyncLog | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM analytics_sync_logs WHERE id = $1',
        [id]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting sync log by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get the latest sync log for an integration
   */
  async getLatestByIntegrationId(integrationId: number): Promise<AnalyticsSyncLog | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM analytics_sync_logs WHERE integration_id = $1 ORDER BY start_time DESC LIMIT 1',
        [integrationId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting latest sync log by integration ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Start a new sync log
   */
  async startSync(integrationId: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO analytics_sync_logs 
         (integration_id, status, start_time) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [
          integrationId,
          'pending',
          new Date()
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error starting sync log:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Complete a sync log
   */
  async completeSync(id: number, recordsProcessed?: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE analytics_sync_logs 
         SET status = $1, end_time = $2, records_processed = $3 
         WHERE id = $4`,
        [
          'completed',
          new Date(),
          recordsProcessed,
          id
        ]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error completing sync log:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Mark a sync log as failed
   */
  async failSync(id: number, errorMessage: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE analytics_sync_logs 
         SET status = $1, end_time = $2, error_message = $3 
         WHERE id = $4`,
        [
          'failed',
          new Date(),
          errorMessage,
          id
        ]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error failing sync log:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete sync logs for an integration
   */
  async deleteByIntegrationId(integrationId: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM analytics_sync_logs WHERE integration_id = $1',
        [integrationId]
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting sync logs by integration ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete old sync logs
   */
  async deleteOldLogs(daysToKeep: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM analytics_sync_logs 
         WHERE start_time < NOW() - INTERVAL '${daysToKeep} days'`
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting old sync logs:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const analyticsSyncLogModel = new AnalyticsSyncLogModel();
