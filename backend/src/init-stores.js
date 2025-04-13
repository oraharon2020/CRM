/**
 * This script initializes the WooCommerce stores in the database from the WooCommerceService
 * Run this script after setting up the database to ensure the stores are properly registered
 */

const { pool, query } = require('./config/database');
const wooCommerceService = require('./services/woocommerce.service').default;

async function initializeStores(closePoolWhenDone = true) {
  try {
    console.log('Starting WooCommerce store initialization...');
    
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
    if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
      console.log('WooCommerce stores table does not exist, creating it...');
      
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
        
        -- Create trigger for updated_at if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_woocommerce_stores_timestamp') THEN
            CREATE OR REPLACE FUNCTION update_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            CREATE TRIGGER update_woocommerce_stores_timestamp
            BEFORE UPDATE ON woocommerce_stores
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
          END IF;
        END
        $$;
      `;
      
      // First create the enum type
      await query(createEnumQuery);
      
      // Then create the table
      await query(createTableQuery);
      
      console.log('WooCommerce stores table created successfully');
    }
    
    // Get all stores from WooCommerceService
    const stores = wooCommerceService.getAllStores();
    
    console.log(`Found ${stores.length} stores in WooCommerceService`);
    
    // Insert each store into the database
    for (const store of stores) {
      console.log(`Processing store: ${store.name} (ID: ${store.id})`);
      
      // Check if store already exists
      const existingStore = await query('SELECT * FROM woocommerce_stores WHERE id = $1', [store.id]);
      
      if (existingStore && existingStore.length > 0) {
        console.log(`Store ${store.name} (ID: ${store.id}) already exists, updating...`);
        
        // Update the store
        await query(
          `UPDATE woocommerce_stores 
           SET name = $1, url = $2, consumer_key = $3, consumer_secret = $4, status = $5
           WHERE id = $6`,
          [
            store.name,
            store.url,
            store.consumer_key,
            store.consumer_secret,
            store.status,
            store.id
          ]
        );
        
        console.log(`Store ${store.name} (ID: ${store.id}) updated successfully`);
      } else {
        console.log(`Store ${store.name} (ID: ${store.id}) does not exist, creating...`);
        
        // Insert the store with the specific ID
        await query(
          `INSERT INTO woocommerce_stores (id, name, url, consumer_key, consumer_secret, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               url = EXCLUDED.url,
               consumer_key = EXCLUDED.consumer_key,
               consumer_secret = EXCLUDED.consumer_secret,
               status = EXCLUDED.status`,
          [
            store.id,
            store.name,
            store.url,
            store.consumer_key,
            store.consumer_secret,
            store.status
          ]
        );
        
        console.log(`Store ${store.name} (ID: ${store.id}) created successfully`);
      }
    }
    
    // Also create entries in the regular stores table if they don't exist
    console.log('Ensuring stores exist in the main stores table...');
    
    for (const store of stores) {
      // Check if store already exists in the main stores table
      const existingStore = await query('SELECT * FROM stores WHERE name = $1', [store.name]);
      
      if (existingStore && existingStore.length > 0) {
        console.log(`Store ${store.name} already exists in main stores table.`);
        
        // Update the is_active status to match the WooCommerce store status
        await query(
          `UPDATE stores 
           SET is_active = $1
           WHERE name = $2`,
          [
            store.status === 'active',
            store.name
          ]
        );
        
        console.log(`Store ${store.name} updated in main stores table.`);
      } else {
        console.log(`Creating store ${store.name} in main stores table...`);
        
        // Insert the store into the main stores table with basic information
        await query(
          `INSERT INTO stores (name, is_active)
           VALUES ($1, $2)`,
          [
            store.name,
            store.status === 'active'
          ]
        );
        
        console.log(`Store ${store.name} created in main stores table.`);
      }
    }
    
    console.log('Store initialization completed successfully');
  } catch (error) {
    console.error('Error initializing stores:', error);
  } finally {
    // Close the pool only if requested
    if (closePoolWhenDone) {
      await pool.end();
    }
  }
}

// Run the initialization function if this file is executed directly
if (require.main === module) {
  initializeStores(true);
}

module.exports = { initializeStores };
