import { pool } from '../config/database';
import format from 'pg-format';

export interface AnalyticsCampaign {
  id?: number;
  integration_id: number;
  store_id: number;
  campaign_id: string;
  name: string;
  status: string;
  platform: string;
  budget?: number;
  start_date?: Date;
  end_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

class AnalyticsCampaignModel {
  /**
   * Create the analytics_campaigns table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
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
        
        CREATE INDEX IF NOT EXISTS idx_analytics_campaigns_integration_id ON analytics_campaigns(integration_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_campaigns_store_id ON analytics_campaigns(store_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_campaigns_campaign_id ON analytics_campaigns(campaign_id);
      `);
      console.log('Analytics campaigns table created or already exists');
    } catch (error) {
      console.error('Error creating analytics campaigns table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all campaigns for an integration
   */
  async getByIntegrationId(integrationId: number, storeId?: number): Promise<AnalyticsCampaign[]> {
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM analytics_campaigns WHERE integration_id = $1';
      const params: any[] = [integrationId];
      
      if (storeId) {
        query += ' AND store_id = $2';
        params.push(storeId);
      }
      
      query += ' ORDER BY name ASC';
      
      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting campaigns by integration ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a campaign by its ID
   */
  async getById(id: number): Promise<AnalyticsCampaign | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM analytics_campaigns WHERE id = $1',
        [id]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting campaign by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a campaign by its campaign ID and integration ID
   */
  async getByCampaignId(integrationId: number, campaignId: string): Promise<AnalyticsCampaign | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM analytics_campaigns WHERE integration_id = $1 AND campaign_id = $2',
        [integrationId, campaignId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting campaign by campaign ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a new campaign
   */
  async create(campaign: AnalyticsCampaign): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO analytics_campaigns 
         (integration_id, store_id, campaign_id, name, status, platform, budget, start_date, end_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id`,
        [
          campaign.integration_id,
          campaign.store_id,
          campaign.campaign_id,
          campaign.name,
          campaign.status,
          campaign.platform,
          campaign.budget,
          campaign.start_date,
          campaign.end_date
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing campaign
   */
  async update(id: number, campaign: Partial<AnalyticsCampaign>): Promise<boolean> {
    const client = await pool.connect();
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build the SET clause dynamically based on provided fields
      for (const [key, value] of Object.entries(campaign)) {
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
        `UPDATE analytics_campaigns 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex}`,
        values
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a campaign
   */
  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM analytics_campaigns WHERE id = $1',
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete all campaigns for an integration
   */
  async deleteByIntegrationId(integrationId: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM analytics_campaigns WHERE integration_id = $1',
        [integrationId]
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting campaigns by integration ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all campaigns with optional filtering
   */
  async getAll(filters: { integration_id?: number; store_id?: number }): Promise<AnalyticsCampaign[]> {
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
        SELECT * FROM analytics_campaigns
        ${whereClause}
        ORDER BY name ASC
      `;
      
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting campaigns with filters:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Insert or update a single campaign
   */
  async upsert(campaign: AnalyticsCampaign): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO analytics_campaigns 
         (integration_id, store_id, campaign_id, name, status, platform, budget, start_date, end_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (integration_id, campaign_id) 
         DO UPDATE SET 
           name = EXCLUDED.name, 
           status = EXCLUDED.status, 
           platform = EXCLUDED.platform, 
           budget = EXCLUDED.budget, 
           start_date = EXCLUDED.start_date, 
           end_date = EXCLUDED.end_date, 
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [
          campaign.integration_id,
          campaign.store_id,
          campaign.campaign_id,
          campaign.name,
          campaign.status,
          campaign.platform,
          campaign.budget,
          campaign.start_date,
          campaign.end_date
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error upserting campaign:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Bulk insert or update campaigns
   */
  async bulkUpsert(campaigns: AnalyticsCampaign[]): Promise<number> {
    if (campaigns.length === 0) {
      return 0;
    }
    
    const client = await pool.connect();
    try {
      // Prepare values for bulk insert
      const values = campaigns.map(campaign => [
        campaign.integration_id,
        campaign.store_id,
        campaign.campaign_id,
        campaign.name,
        campaign.status,
        campaign.platform,
        campaign.budget,
        campaign.start_date,
        campaign.end_date
      ]);
      
      // Format the query for bulk insert
      const query = format(
        `INSERT INTO analytics_campaigns 
         (integration_id, store_id, campaign_id, name, status, platform, budget, start_date, end_date) 
         VALUES %L 
         ON CONFLICT (integration_id, campaign_id) 
         DO UPDATE SET 
           name = EXCLUDED.name, 
           status = EXCLUDED.status, 
           platform = EXCLUDED.platform, 
           budget = EXCLUDED.budget, 
           start_date = EXCLUDED.start_date, 
           end_date = EXCLUDED.end_date, 
           updated_at = CURRENT_TIMESTAMP`,
        values
      );
      
      const result = await client.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Error bulk upserting campaigns:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const analyticsCampaignModel = new AnalyticsCampaignModel();
