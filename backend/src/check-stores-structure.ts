/**
 * This script checks the structure of the stores table in the database
 */

import { pool, query } from './config/database';

async function checkStoresStructure() {
  try {
    console.log('Checking stores table structure...');
    
    // Check if the stores table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stores'
      );
    `;
    
    const tableExists = await query(tableExistsQuery);
    
    if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
      console.log('Stores table does not exist.');
      return;
    }
    
    console.log('Stores table exists, checking its structure...');
    
    // Get the table structure
    const tableStructureQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'stores'
      ORDER BY ordinal_position;
    `;
    
    const tableStructure = await query(tableStructureQuery);
    
    console.log('Stores table structure:');
    console.table(tableStructure);
    
    // Check if woocommerce_stores table exists
    const wcTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'woocommerce_stores'
      );
    `;
    
    const wcTableExists = await query(wcTableExistsQuery);
    
    if (!wcTableExists || !wcTableExists[0] || !wcTableExists[0].exists) {
      console.log('WooCommerce stores table does not exist.');
      return;
    }
    
    console.log('WooCommerce stores table exists, checking its structure...');
    
    // Get the table structure
    const wcTableStructureQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'woocommerce_stores'
      ORDER BY ordinal_position;
    `;
    
    const wcTableStructure = await query(wcTableStructureQuery);
    
    console.log('WooCommerce stores table structure:');
    console.table(wcTableStructure);
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkStoresStructure();
