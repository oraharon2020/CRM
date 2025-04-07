// Import the database module
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Check integrations in the database
 */
async function checkIntegrations(): Promise<void> {
  // Create a connection pool
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'global_crm',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000
  });

  try {
    console.log('Connecting to database...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('Database connection successful!');
    client.release();
    
    // Query integration_settings
    console.log('\nRetrieving integrations from database...');
    
    const integrations = await pool.query('SELECT * FROM integration_settings');
    
    if (integrations.rows.length === 0) {
      console.log('No integrations found in the database.');
    } else {
      console.log(`Found ${integrations.rows.length} integrations:`);
      console.table(integrations.rows);
    }
    
    // Check if the table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'integration_settings'
      );
    `);
    
    console.log(`\nintegration_settings table exists: ${tableCheck.rows[0].exists}`);
    
    // List all tables in the database
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nTables in the database:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error checking integrations:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the check
checkIntegrations();
