import { pool, query, formatQuery } from '../config/database';

/**
 * Model for product cache
 */
class ProductCacheModel {
  /**
   * Initialize the product cache table
   */
  async initTable(): Promise<void> {
    try {
      // Check if the product_cache table exists
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = current_schema() 
        AND table_name = 'product_cache'
      `);
      
      if (tables.length === 0) {
        console.log('Creating product_cache table');
        
        // Create the product_cache table
        await pool.query(`
          CREATE TABLE product_cache (
            id SERIAL PRIMARY KEY,
            store_id INT NOT NULL,
            product_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            sku VARCHAR(100),
            quantity INT DEFAULT 0,
            revenue DECIMAL(10, 2) DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Create indexes
          CREATE INDEX idx_store_product ON product_cache(store_id, product_id);
          CREATE INDEX idx_store_revenue ON product_cache(store_id, revenue DESC);
          
          -- Create trigger for last_updated
          CREATE OR REPLACE FUNCTION update_product_cache_timestamp()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.last_updated = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          
          CREATE TRIGGER update_product_cache_timestamp
          BEFORE UPDATE ON product_cache
          FOR EACH ROW
          EXECUTE FUNCTION update_product_cache_timestamp();
        `);
        
        // Create the product_cache_config table
        await pool.query(`
          CREATE TABLE product_cache_config (
            id SERIAL PRIMARY KEY,
            store_id INT NOT NULL UNIQUE,
            cache_ttl_hours INT DEFAULT 72,
            sync_frequency_hours INT DEFAULT 24,
            last_full_sync TIMESTAMP NULL,
            last_incremental_sync TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Create index
          CREATE INDEX idx_store_id ON product_cache_config(store_id);
          
          -- Create trigger for updated_at
          CREATE TRIGGER update_product_cache_config_timestamp
          BEFORE UPDATE ON product_cache_config
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        `);
      } else {
        console.log('product_cache table already exists');
        
        // Check if the product_cache_config table exists
        const configTables = await query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = current_schema() 
          AND table_name = 'product_cache_config'
        `);
        
        if (configTables.length === 0) {
          console.log('Creating product_cache_config table');
          
          // Create the product_cache_config table
          await pool.query(`
            CREATE TABLE product_cache_config (
              id SERIAL PRIMARY KEY,
              store_id INT NOT NULL UNIQUE,
              cache_ttl_hours INT DEFAULT 72,
              sync_frequency_hours INT DEFAULT 24,
              last_full_sync TIMESTAMP NULL,
              last_incremental_sync TIMESTAMP NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Create index
            CREATE INDEX idx_store_id ON product_cache_config(store_id);
            
            -- Create trigger for updated_at
            CREATE TRIGGER update_product_cache_config_timestamp
            BEFORE UPDATE ON product_cache_config
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
          `);
        } else {
          console.log('product_cache_config table already exists');
        }
      }
    } catch (error) {
      console.error('Error initializing product cache table:', error);
      throw error;
    }
  }
  
  /**
   * Get products by store ID
   */
  async getByStoreId(storeId: number): Promise<any[]> {
    try {
      const rows = await query(
        'SELECT * FROM product_cache WHERE store_id = $1 ORDER BY revenue DESC',
        [storeId]
      );
      
      return rows;
    } catch (error) {
      console.error(`Error getting products for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Save products to cache (full replacement)
   */
  async saveProducts(storeId: number, products: any[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing products for this store
      await client.query('DELETE FROM product_cache WHERE store_id = $1', [storeId]);
      
      // Insert new products
      if (products.length > 0) {
        // Use pg-format to create a multi-row insert
        const insertQuery = formatQuery(
          'INSERT INTO product_cache (store_id, product_id, name, sku, quantity, revenue) VALUES %L',
          products.map(product => [
            storeId,
            product.product_id,
            product.name,
            product.sku || '',
            product.quantity || 0,
            product.revenue || 0
          ])
        );
        
        await client.query(insertQuery);
      }
      
      // Update the last_full_sync timestamp in the config
      await this.updateSyncTimestamp(client, storeId, 'full');
      
      await client.query('COMMIT');
      
      console.log(`Saved ${products.length} products to cache for store ${storeId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error saving products for store ${storeId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Update products in cache (incremental update)
   */
  async updateProducts(storeId: number, products: any[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Process each product
      for (const product of products) {
        // Check if product exists
        const existingProducts = await client.query(
          'SELECT * FROM product_cache WHERE store_id = $1 AND product_id = $2',
          [storeId, product.product_id]
        );
        
        if (existingProducts.rows.length > 0) {
          // Update existing product
          await client.query(
            `UPDATE product_cache 
             SET name = $1, sku = $2, quantity = quantity + $3, revenue = revenue + $4
             WHERE store_id = $5 AND product_id = $6`,
            [
              product.name,
              product.sku || '',
              product.quantity || 0,
              product.revenue || 0,
              storeId,
              product.product_id
            ]
          );
        } else {
          // Insert new product
          await client.query(
            `INSERT INTO product_cache 
             (store_id, product_id, name, sku, quantity, revenue)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              storeId,
              product.product_id,
              product.name,
              product.sku || '',
              product.quantity || 0,
              product.revenue || 0
            ]
          );
        }
      }
      
      // Update the last_incremental_sync timestamp in the config
      await this.updateSyncTimestamp(client, storeId, 'incremental');
      
      await client.query('COMMIT');
      
      console.log(`Updated ${products.length} products in cache for store ${storeId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error updating products for store ${storeId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Update sync timestamp in config
   */
  private async updateSyncTimestamp(
    client: any,
    storeId: number,
    syncType: 'full' | 'incremental'
  ): Promise<void> {
    try {
      // Check if config exists
      const configs = await client.query(
        'SELECT * FROM product_cache_config WHERE store_id = $1',
        [storeId]
      );
      
      const timestampField = syncType === 'full' ? 'last_full_sync' : 'last_incremental_sync';
      
      if (configs.rows.length > 0) {
        // Update existing config
        await client.query(
          `UPDATE product_cache_config SET ${timestampField} = NOW() WHERE store_id = $1`,
          [storeId]
        );
      } else {
        // Insert new config with default values
        await client.query(
          `INSERT INTO product_cache_config 
           (store_id, ${timestampField})
           VALUES ($1, NOW())`,
          [storeId]
        );
      }
    } catch (error) {
      console.error(`Error updating sync timestamp for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear cache for a store
   */
  async clearCache(storeId: number): Promise<void> {
    try {
      await query('DELETE FROM product_cache WHERE store_id = $1', [storeId]);
      console.log(`Cleared cache for store ${storeId}`);
    } catch (error) {
      console.error(`Error clearing cache for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if cache is fresh
   */
  async isCacheFresh(storeId: number): Promise<boolean> {
    try {
      // Get cache config
      const configs = await query(
        'SELECT * FROM product_cache_config WHERE store_id = $1',
        [storeId]
      );
      
      if (configs.length === 0) {
        // No config, cache is not fresh
        return false;
      }
      
      const config = configs[0];
      
      // Get the most recent sync timestamp
      const lastFullSync = config.last_full_sync ? new Date(config.last_full_sync) : null;
      const lastIncrementalSync = config.last_incremental_sync ? new Date(config.last_incremental_sync) : null;
      
      // If no syncs have been performed, cache is not fresh
      if (!lastFullSync && !lastIncrementalSync) {
        return false;
      }
      
      // Get the most recent sync timestamp
      const lastSync = lastIncrementalSync && lastFullSync
        ? (lastIncrementalSync > lastFullSync ? lastIncrementalSync : lastFullSync)
        : (lastIncrementalSync || lastFullSync);
      
      // Calculate the age of the cache in hours
      const now = new Date();
      // Ensure lastSync is not null before using it
      if (!lastSync) return false;
      
      const cacheAgeHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
      
      // Check if cache is fresh based on TTL
      return cacheAgeHours < config.cache_ttl_hours;
    } catch (error) {
      console.error(`Error checking cache freshness for store ${storeId}:`, error);
      return false;
    }
  }
  
  /**
   * Check if a full sync is needed
   */
  async isFullSyncNeeded(storeId: number): Promise<boolean> {
    try {
      // Get cache config
      const configs = await query(
        'SELECT * FROM product_cache_config WHERE store_id = $1',
        [storeId]
      );
      
      if (configs.length === 0) {
        // No config, full sync is needed
        return true;
      }
      
      const config = configs[0];
      
      // If no full sync has been performed, full sync is needed
      if (!config.last_full_sync) {
        return true;
      }
      
      // Calculate the age of the last full sync in hours
      const now = new Date();
      const lastFullSync = new Date(config.last_full_sync);
      const fullSyncAgeHours = (now.getTime() - lastFullSync.getTime()) / (1000 * 60 * 60);
      
      // Check if full sync is needed based on sync frequency
      return fullSyncAgeHours >= config.sync_frequency_hours;
    } catch (error) {
      console.error(`Error checking if full sync is needed for store ${storeId}:`, error);
      return true;
    }
  }
  
  /**
   * Get cache statistics for a store
   */
  async getCacheStats(storeId: number): Promise<any> {
    try {
      // Get product count
      const countResult = await query(
        'SELECT COUNT(*) as total_products FROM product_cache WHERE store_id = $1',
        [storeId]
      );
      
      // Get total quantity and revenue
      const totalsResult = await query(
        'SELECT SUM(quantity) as total_quantity, SUM(revenue) as total_revenue FROM product_cache WHERE store_id = $1',
        [storeId]
      );
      
      // Get oldest and newest entries
      const timeResult = await query(
        'SELECT MIN(created_at) as oldest_entry, MAX(last_updated) as newest_entry FROM product_cache WHERE store_id = $1',
        [storeId]
      );
      
      // Get cache config
      const configs = await query(
        'SELECT * FROM product_cache_config WHERE store_id = $1',
        [storeId]
      );
      
      const totalProducts = countResult[0]?.total_products || 0;
      const totalQuantity = totalsResult[0]?.total_quantity || 0;
      const totalRevenue = totalsResult[0]?.total_revenue || 0;
      const oldestEntry = timeResult[0]?.oldest_entry;
      const newestEntry = timeResult[0]?.newest_entry;
      
      // Default config values
      let cacheTtlHours = 72;
      let syncFrequencyHours = 24;
      let lastFullSync = null;
      let lastIncrementalSync = null;
      
      if (configs.length > 0) {
        const config = configs[0];
        cacheTtlHours = config.cache_ttl_hours;
        syncFrequencyHours = config.sync_frequency_hours;
        lastFullSync = config.last_full_sync;
        lastIncrementalSync = config.last_incremental_sync;
      }
      
      // Calculate cache freshness as a percentage
      let cacheFreshness = 0;
      
      if (lastFullSync || lastIncrementalSync) {
        // Get the most recent sync timestamp
        const lastSync = lastIncrementalSync && lastFullSync
          ? (new Date(lastIncrementalSync) > new Date(lastFullSync) ? new Date(lastIncrementalSync) : new Date(lastFullSync))
          : (lastIncrementalSync ? new Date(lastIncrementalSync) : new Date(lastFullSync));
        
        // Calculate the age of the cache in hours
        const now = new Date();
        const cacheAgeHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        
        // Calculate freshness as a percentage (100% when fresh, 0% when expired)
        cacheFreshness = Math.max(0, Math.min(100, 100 - (cacheAgeHours / cacheTtlHours * 100)));
        cacheFreshness = Math.round(cacheFreshness);
      }
      
      return {
        total_products: totalProducts,
        total_quantity: totalQuantity,
        total_revenue: totalRevenue,
        oldest_entry: oldestEntry,
        newest_entry: newestEntry,
        cache_ttl_hours: cacheTtlHours,
        sync_frequency_hours: syncFrequencyHours,
        last_full_sync: lastFullSync,
        last_incremental_sync: lastIncrementalSync,
        cache_freshness: cacheFreshness
      };
    } catch (error) {
      console.error(`Error getting cache stats for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get cache configuration for a store
   */
  async getCacheConfig(storeId: number): Promise<any> {
    try {
      // Get cache config
      const configs = await query(
        'SELECT * FROM product_cache_config WHERE store_id = $1',
        [storeId]
      );
      
      if (configs.length > 0) {
        return configs[0];
      }
      
      // No config found, create one with default values
      const result = await query(
        `INSERT INTO product_cache_config 
         (store_id, cache_ttl_hours, sync_frequency_hours)
         VALUES ($1, 72, 24)
         RETURNING id`,
        [storeId]
      );
      
      const insertId = result[0].id;
      
      // Get the newly created config
      const newConfigs = await query(
        'SELECT * FROM product_cache_config WHERE id = $1',
        [insertId]
      );
      
      return newConfigs[0];
    } catch (error) {
      console.error(`Error getting cache config for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update cache configuration for a store
   */
  async updateCacheConfig(storeId: number, config: any): Promise<void> {
    try {
      // Check if config exists
      const configs = await query(
        'SELECT * FROM product_cache_config WHERE store_id = $1',
        [storeId]
      );
      
      // Prepare update fields
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;
      
      if (config.cache_ttl_hours !== undefined) {
        updateFields.push(`cache_ttl_hours = $${paramIndex++}`);
        updateValues.push(config.cache_ttl_hours);
      }
      
      if (config.sync_frequency_hours !== undefined) {
        updateFields.push(`sync_frequency_hours = $${paramIndex++}`);
        updateValues.push(config.sync_frequency_hours);
      }
      
      // If no fields to update, return
      if (updateFields.length === 0) {
        return;
      }
      
      if (configs.length > 0) {
        // Update existing config
        await query(
          `UPDATE product_cache_config SET ${updateFields.join(', ')} WHERE store_id = $${paramIndex}`,
          [...updateValues, storeId]
        );
      } else {
        // Insert new config with default values
        const fields = ['store_id'];
        const placeholders = ['$1'];
        const values = [storeId];
        let paramIndex = 2;
        
        if (config.cache_ttl_hours !== undefined) {
          fields.push('cache_ttl_hours');
          placeholders.push(`$${paramIndex++}`);
          values.push(config.cache_ttl_hours);
        }
        
        if (config.sync_frequency_hours !== undefined) {
          fields.push('sync_frequency_hours');
          placeholders.push(`$${paramIndex++}`);
          values.push(config.sync_frequency_hours);
        }
        
        await query(
          `INSERT INTO product_cache_config (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
          values
        );
      }
      
      console.log(`Updated cache config for store ${storeId}`);
    } catch (error) {
      console.error(`Error updating cache config for store ${storeId}:`, error);
      throw error;
    }
  }
}

export default new ProductCacheModel();
