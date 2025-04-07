import { pool } from '../config/database';
import format from 'pg-format';

export interface AnalyticsPerformance {
  id?: number;
  integration_id: number;
  store_id: number;
  campaign_id?: string;
  date: Date;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  created_at?: Date;
  updated_at?: Date;
}

interface PerformanceFilters {
  integration_id?: number;
  store_id?: number;
  campaign_id?: string;
  start_date?: Date;
  end_date?: Date;
}

interface AggregationFilters extends PerformanceFilters {
  group_by: 'day' | 'week' | 'month' | 'campaign' | 'platform';
}

class AnalyticsPerformanceModel {
  /**
   * Create the analytics_performance table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
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
        
        CREATE INDEX IF NOT EXISTS idx_analytics_performance_integration_id ON analytics_performance(integration_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_performance_store_id ON analytics_performance(store_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_performance_campaign_id ON analytics_performance(campaign_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_performance_date ON analytics_performance(date);
      `);
      console.log('Analytics performance table created or already exists');
    } catch (error) {
      console.error('Error creating analytics performance table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all performance data with optional filtering
   */
  async getAll(filters: PerformanceFilters): Promise<AnalyticsPerformance[]> {
    const client = await pool.connect();
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build the WHERE clause dynamically based on provided filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          if (key === 'start_date') {
            conditions.push(`date >= $${paramIndex}`);
            values.push(value);
            paramIndex++;
          } else if (key === 'end_date') {
            conditions.push(`date <= $${paramIndex}`);
            values.push(value);
            paramIndex++;
          } else {
            conditions.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        }
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const query = `
        SELECT * FROM analytics_performance
        ${whereClause}
        ORDER BY date DESC
      `;
      
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting performance data with filters:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get aggregated performance data
   */
  async getAggregated(filters: AggregationFilters): Promise<any[]> {
    const client = await pool.connect();
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build the WHERE clause dynamically based on provided filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && key !== 'group_by') {
          if (key === 'start_date') {
            conditions.push(`date >= $${paramIndex}`);
            values.push(value);
            paramIndex++;
          } else if (key === 'end_date') {
            conditions.push(`date <= $${paramIndex}`);
            values.push(value);
            paramIndex++;
          } else {
            conditions.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        }
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Define the GROUP BY clause based on the group_by parameter
      let groupByClause = '';
      let selectClause = '';
      
      switch (filters.group_by) {
        case 'day':
          groupByClause = 'GROUP BY date';
          selectClause = 'date as period';
          break;
        case 'week':
          groupByClause = 'GROUP BY DATE_TRUNC(\'week\', date)';
          selectClause = 'DATE_TRUNC(\'week\', date) as period';
          break;
        case 'month':
          groupByClause = 'GROUP BY DATE_TRUNC(\'month\', date)';
          selectClause = 'DATE_TRUNC(\'month\', date) as period';
          break;
        case 'campaign':
          groupByClause = 'GROUP BY campaign_id';
          selectClause = 'campaign_id as period';
          break;
        case 'platform':
          groupByClause = `GROUP BY (
            SELECT platform FROM analytics_campaigns 
            WHERE analytics_campaigns.integration_id = analytics_performance.integration_id 
            AND analytics_campaigns.campaign_id = analytics_performance.campaign_id
          )`;
          selectClause = `(
            SELECT platform FROM analytics_campaigns 
            WHERE analytics_campaigns.integration_id = analytics_performance.integration_id 
            AND analytics_campaigns.campaign_id = analytics_performance.campaign_id
          ) as period`;
          break;
        default:
          groupByClause = 'GROUP BY date';
          selectClause = 'date as period';
      }
      
      const query = `
        SELECT 
          ${selectClause},
          SUM(impressions) as impressions,
          SUM(clicks) as clicks,
          SUM(cost) as cost,
          SUM(conversions) as conversions,
          SUM(conversion_value) as conversion_value,
          CASE WHEN SUM(impressions) > 0 THEN SUM(clicks)::float / SUM(impressions) ELSE 0 END as ctr,
          CASE WHEN SUM(clicks) > 0 THEN SUM(cost) / SUM(clicks) ELSE 0 END as cpc,
          CASE WHEN SUM(cost) > 0 THEN SUM(conversion_value) / SUM(cost) ELSE 0 END as roas
        FROM analytics_performance
        ${whereClause}
        ${groupByClause}
        ORDER BY period
      `;
      
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting aggregated performance data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get performance data by ID
   */
  async getById(id: number): Promise<AnalyticsPerformance | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM analytics_performance WHERE id = $1',
        [id]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting performance data by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create new performance data
   */
  async create(performance: AnalyticsPerformance): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO analytics_performance 
         (integration_id, store_id, campaign_id, date, impressions, clicks, cost, conversions, conversion_value) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id`,
        [
          performance.integration_id,
          performance.store_id,
          performance.campaign_id,
          performance.date,
          performance.impressions,
          performance.clicks,
          performance.cost,
          performance.conversions,
          performance.conversion_value
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating performance data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update existing performance data
   */
  async update(id: number, performance: Partial<AnalyticsPerformance>): Promise<boolean> {
    const client = await pool.connect();
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build the SET clause dynamically based on provided fields
      for (const [key, value] of Object.entries(performance)) {
        if (key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }
      
      // Add updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Add the ID as the last parameter
      values.push(id);
      
      const result = await client.query(
        `UPDATE analytics_performance 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex}`,
        values
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating performance data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete performance data
   */
  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM analytics_performance WHERE id = $1',
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting performance data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete all performance data for an integration
   */
  async deleteByIntegrationId(integrationId: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM analytics_performance WHERE integration_id = $1',
        [integrationId]
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting performance data by integration ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Insert or update performance data
   */
  async upsert(performance: AnalyticsPerformance): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO analytics_performance 
         (integration_id, store_id, campaign_id, date, impressions, clicks, cost, conversions, conversion_value) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (integration_id, campaign_id, date) 
         DO UPDATE SET 
           impressions = EXCLUDED.impressions, 
           clicks = EXCLUDED.clicks, 
           cost = EXCLUDED.cost, 
           conversions = EXCLUDED.conversions, 
           conversion_value = EXCLUDED.conversion_value, 
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [
          performance.integration_id,
          performance.store_id,
          performance.campaign_id,
          performance.date,
          performance.impressions,
          performance.clicks,
          performance.cost,
          performance.conversions,
          performance.conversion_value
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error upserting performance data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Bulk insert or update performance data
   */
  async bulkUpsert(performanceData: AnalyticsPerformance[]): Promise<number> {
    if (performanceData.length === 0) {
      return 0;
    }
    
    const client = await pool.connect();
    try {
      // Prepare values for bulk insert
      const values = performanceData.map(performance => [
        performance.integration_id,
        performance.store_id,
        performance.campaign_id,
        performance.date,
        performance.impressions,
        performance.clicks,
        performance.cost,
        performance.conversions,
        performance.conversion_value
      ]);
      
      // Format the query for bulk insert
      const query = format(
        `INSERT INTO analytics_performance 
         (integration_id, store_id, campaign_id, date, impressions, clicks, cost, conversions, conversion_value) 
         VALUES %L 
         ON CONFLICT (integration_id, campaign_id, date) 
         DO UPDATE SET 
           impressions = EXCLUDED.impressions, 
           clicks = EXCLUDED.clicks, 
           cost = EXCLUDED.cost, 
           conversions = EXCLUDED.conversions, 
           conversion_value = EXCLUDED.conversion_value, 
           updated_at = CURRENT_TIMESTAMP`,
        values
      );
      
      const result = await client.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Error bulk upserting performance data:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const analyticsPerformanceModel = new AnalyticsPerformanceModel();
