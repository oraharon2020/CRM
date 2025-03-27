const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'global_crm',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as time');
    console.log('Current database time:', result.rows[0].time);
    
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Please check your database configuration in .env file');
    return false;
  }
}

async function runMigration(migrationFile) {
  const client = await pool.connect();
  
  try {
    console.log(`Running migration: ${migrationFile}`);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Run the migration
    await client.query(sql);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log(`Migration ${migrationFile} completed successfully`);
    return true;
  } catch (error) {
    // Rollback the transaction on error
    await client.query('ROLLBACK');
    console.error(`Migration ${migrationFile} failed:`, error);
    return false;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

async function main() {
  try {
    // Test the database connection
    const connectionSuccessful = await testConnection();
    
    if (!connectionSuccessful) {
      console.error('Exiting due to database connection failure');
      process.exit(1);
    }
    
    // Run the migration
    const migrationSuccessful = await runMigration('add_woocommerce_stores.sql');
    
    if (!migrationSuccessful) {
      console.error('Exiting due to migration failure');
      process.exit(1);
    }
    
    console.log('Database connection and migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the main function
main();
