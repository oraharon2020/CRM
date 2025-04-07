/**
 * This script tests the database connection
 */

import { pool, testConnection } from './config/database';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    await testConnection();
    
    console.log('Database connection successful!');
    
    // Try a simple query
    const client = await pool.connect();
    try {
      console.log('Executing a simple query...');
      
      const result = await client.query('SELECT current_database() as db_name');
      console.log('Current database:', result.rows[0].db_name);
      
      // List all tables
      console.log('Listing all tables...');
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      if (tablesResult.rows.length === 0) {
        console.log('No tables found in the database.');
      } else {
        console.log('Tables in the database:');
        tablesResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
      
      // Check if stores table exists
      console.log('Checking if stores table exists...');
      const storesTableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'stores'
        );
      `);
      
      if (storesTableResult.rows[0].exists) {
        console.log('Stores table exists, checking its structure...');
        
        // Get the table structure
        const tableStructureResult = await client.query(`
          SELECT column_name, data_type, character_maximum_length
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'stores'
          ORDER BY ordinal_position;
        `);
        
        console.log('Stores table structure:');
        console.table(tableStructureResult.rows);
      } else {
        console.log('Stores table does not exist.');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
testDatabaseConnection();
