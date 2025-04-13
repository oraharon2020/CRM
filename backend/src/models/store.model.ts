import { query } from '../config/database';
import wooCommerceService from '../services/woocommerce.service';

export interface Store {
  id?: number;
  name: string;
  url: string;
  consumer_key: string;
  consumer_secret: string;
  status: 'active' | 'inactive';
  last_sync?: string;
}

class StoreModel {
  /**
   * Create stores table if it doesn't exist
   */
  async createTable(): Promise<void> {
    // First create the store_status enum type if it doesn't exist
    const createEnumQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_status') THEN
          CREATE TYPE store_status AS ENUM ('active', 'inactive');
        END IF;
      END
      $$;
    `;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS woocommerce_stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        consumer_key VARCHAR(255) NOT NULL,
        consumer_secret VARCHAR(255) NOT NULL,
        status store_status NOT NULL DEFAULT 'active',
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createTriggerQuery = `
      -- Create function if it doesn't exist
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $BODY$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $BODY$ LANGUAGE plpgsql;
      
      -- Create trigger if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_woocommerce_stores_timestamp') THEN
          CREATE TRIGGER update_woocommerce_stores_timestamp
          BEFORE UPDATE ON woocommerce_stores
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        END IF;
      END
      $$;
    `;

    try {
      // First create the enum type
      await query(createEnumQuery);
      
      // Then create the table
      await query(createTableQuery);
      
      // Then create the trigger
      try {
        await query(createTriggerQuery);
      } catch (triggerError) {
        console.error('Error creating trigger (non-critical):', triggerError);
        // Continue even if trigger creation fails
      }
      
      console.log('WooCommerce stores table created or already exists');
    } catch (error) {
      console.error('Error creating WooCommerce stores table:', error);
      throw error;
    }
  }

  /**
   * Get all stores
   */
  async getAll(): Promise<Store[]> {
    try {
      // Use WooCommerce service as the primary source of truth
      const stores = wooCommerceService.getAllStores().map(store => ({
        ...store,
        consumer_secret: '********', // Mask the secret for security
        status: (store.status === 'active' || store.status === 'inactive') 
          ? store.status as 'active' | 'inactive'
          : 'active' // Default to active if status is not valid
      }));
      
      console.log('Retrieved stores from WooCommerce service:', stores.length);
      
      // Try to sync with database if possible
      try {
        // First check if the woocommerce_stores table exists
        const tableExistsQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'woocommerce_stores'
          );
        `;
        
        const tableExists = await query(tableExistsQuery);
        
        // If table doesn't exist, create it
        if (!tableExists || !tableExists.rows || !tableExists.rows[0] || !tableExists.rows[0].exists) {
          console.log('WooCommerce stores table does not exist, creating it...');
          await this.createTable();
        }
        
        // Sync stores to database
        for (const store of stores) {
          if (store.id) {
            try {
              // Check if store exists in database
              const existsQuery = `
                SELECT EXISTS (
                  SELECT FROM woocommerce_stores 
                  WHERE id = $1
                );
              `;
              
              const exists = await query(existsQuery, [store.id]);
              
              if (!exists || !exists.rows || !exists.rows[0] || !exists.rows[0].exists) {
                // Insert store
                await query(
                  `INSERT INTO woocommerce_stores (id, name, url, consumer_key, consumer_secret, status)
                   VALUES ($1, $2, $3, $4, $5, $6)
                   ON CONFLICT (id) DO NOTHING`,
                  [
                    store.id,
                    store.name,
                    store.url,
                    store.consumer_key,
                    store.consumer_secret,
                    store.status
                  ]
                );
              }
            } catch (syncError) {
              console.error(`Error syncing store ${store.id} to database:`, syncError);
              // Continue with next store
            }
          }
        }
      } catch (dbError) {
        console.error('Error syncing stores to database:', dbError);
        // Continue with WooCommerce stores
      }
      
      return stores as Store[];
    } catch (error) {
      console.error('Error getting stores:', error);
      return [];
    }
  }

  /**
   * Get store by ID
   */
  async getById(id: number): Promise<Store | null> {
    try {
      // Use WooCommerce service as the primary source of truth
      try {
        const wcStore = wooCommerceService.getStore(id);
        const store = {
          ...wcStore,
          consumer_secret: '********', // Mask the secret for security
          status: (wcStore.status === 'active' || wcStore.status === 'inactive') 
            ? wcStore.status as 'active' | 'inactive'
            : 'active' // Default to active if status is not valid
        };
        
        // Try to sync with database if possible
        try {
          // First check if the table exists
          const tableExistsQuery = `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'woocommerce_stores'
            );
          `;
          
          const tableExists = await query(tableExistsQuery);
          
          // If table doesn't exist, create it
          if (!tableExists || !tableExists.rows || !tableExists.rows[0] || !tableExists.rows[0].exists) {
            console.log('WooCommerce stores table does not exist, creating it...');
            await this.createTable();
          }
          
          // Insert or update the store in the database
          const insertStoreQuery = `
            INSERT INTO woocommerce_stores (id, name, url, consumer_key, consumer_secret, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name,
                url = EXCLUDED.url,
                consumer_key = EXCLUDED.consumer_key,
                consumer_secret = EXCLUDED.consumer_secret,
                status = EXCLUDED.status
            RETURNING id
          `;
          
          await query(insertStoreQuery, [
            id,
            wcStore.name,
            wcStore.url,
            wcStore.consumer_key,
            wcStore.consumer_secret,
            wcStore.status
          ]);
        } catch (dbError) {
          console.error(`Error syncing store ${id} to database:`, dbError);
          // Continue with WooCommerce store
        }
        
        return store;
      } catch (wcError) {
        console.error(`Error getting store with ID ${id} from WooCommerce service:`, wcError);
        
        // Try database as fallback
        try {
          const result = await query('SELECT * FROM woocommerce_stores WHERE id = $1', [id]);
          
          if (result && result.rows && result.rows.length > 0) {
            return result.rows[0] as Store;
          }
          
          return null;
        } catch (dbError) {
          console.error(`Error getting store with ID ${id} from database:`, dbError);
          return null;
        }
      }
    } catch (error) {
      console.error(`Error getting store with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new store
   */
  async create(store: Store): Promise<number> {
    try {
      // Generate a unique ID for the store if not provided
      const storeId = store.id || Math.floor(Math.random() * 1000000000) + 1000000000;
      
      // Register store with WooCommerce service
      wooCommerceService.registerStore({
        id: storeId,
        name: store.name,
        url: store.url,
        consumer_key: store.consumer_key,
        consumer_secret: store.consumer_secret,
        status: store.status || 'active'
      });
      
      // Try to sync with database if possible
      try {
        const result = await query(
          `INSERT INTO woocommerce_stores (id, name, url, consumer_key, consumer_secret, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               url = EXCLUDED.url,
               consumer_key = EXCLUDED.consumer_key,
               consumer_secret = EXCLUDED.consumer_secret,
               status = EXCLUDED.status
           RETURNING id`,
          [
            storeId,
            store.name,
            store.url,
            store.consumer_key,
            store.consumer_secret,
            store.status || 'active'
          ]
        );
      } catch (dbError) {
        console.error('Error syncing new store to database:', dbError);
        // Continue with WooCommerce store
      }
      
      return storeId;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  /**
   * Update an existing store
   */
  async update(id: number, store: Partial<Store>): Promise<boolean> {
    try {
      // Get the current store from WooCommerce service
      const currentStore = wooCommerceService.getStore(id);
      
      if (!currentStore) {
        return false;
      }
      
      // Create updated store object
      const updatedStore = {
        id,
        name: store.name !== undefined ? store.name : currentStore.name,
        url: store.url !== undefined ? store.url : currentStore.url,
        consumer_key: store.consumer_key !== undefined ? store.consumer_key : currentStore.consumer_key,
        consumer_secret: store.consumer_secret !== undefined ? store.consumer_secret : currentStore.consumer_secret,
        status: store.status !== undefined ? store.status : currentStore.status
      };
      
      // Re-register store with WooCommerce service
      wooCommerceService.registerStore({
        id,
        name: updatedStore.name,
        url: updatedStore.url,
        consumer_key: updatedStore.consumer_key,
        consumer_secret: updatedStore.consumer_secret,
        status: updatedStore.status
      });
      
      // Try to sync with database if possible
      try {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        if (store.name !== undefined) {
          fields.push(`name = $${paramIndex++}`);
          values.push(store.name);
        }
        
        if (store.url !== undefined) {
          fields.push(`url = $${paramIndex++}`);
          values.push(store.url);
        }
        
        if (store.consumer_key !== undefined) {
          fields.push(`consumer_key = $${paramIndex++}`);
          values.push(store.consumer_key);
        }
        
        if (store.consumer_secret !== undefined) {
          fields.push(`consumer_secret = $${paramIndex++}`);
          values.push(store.consumer_secret);
        }
        
        if (store.status !== undefined) {
          fields.push(`status = $${paramIndex++}`);
          values.push(store.status);
        }
        
        if (store.last_sync !== undefined) {
          fields.push(`last_sync = $${paramIndex++}`);
          values.push(store.last_sync);
        }
        
        if (fields.length > 0) {
          const sql = `UPDATE woocommerce_stores SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
          values.push(id);
          
          await query(sql, values);
        }
      } catch (dbError) {
        console.error(`Error syncing updated store ${id} to database:`, dbError);
        // Continue with WooCommerce store
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating store with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete a store
   */
  async delete(id: number): Promise<boolean> {
    try {
      // Remove from WooCommerce service
      try {
        console.log(`Attempting to remove store ${id} from WooCommerce service`);
        wooCommerceService.removeStore(id);
        console.log(`Successfully removed store ${id} from WooCommerce service`);
      } catch (wcError) {
        console.error(`Error removing store ${id} from WooCommerce service:`, wcError);
        // Continue with operation even if this part fails
      }
      
      // Try to delete from database if possible
      try {
        console.log(`Attempting to delete store ${id} from database`);
        await query('DELETE FROM woocommerce_stores WHERE id = $1', [id]);
        console.log(`Successfully deleted store ${id} from database`);
      } catch (dbError) {
        console.error(`Error deleting store ${id} from database:`, dbError);
        // Continue with operation
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting store with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Update store last sync timestamp
   */
  async updateLastSync(id: number): Promise<boolean> {
    try {
      // Try to update in database if possible
      try {
        await query(
          'UPDATE woocommerce_stores SET last_sync = CURRENT_TIMESTAMP WHERE id = $1',
          [id]
        );
      } catch (dbError) {
        console.error(`Error updating last sync for store ${id} in database:`, dbError);
        // Continue with operation
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating last sync for store with ID ${id}:`, error);
      return false;
    }
  }
}

export const storeModel = new StoreModel();
