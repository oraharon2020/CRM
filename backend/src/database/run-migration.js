const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
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

async function runMigration(migrationFile) {
  const client = await pool.connect();
  
  try {
    console.log(`Running migration: ${migrationFile}`);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Run the migration
    await client.query(sql);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log(`Migration ${migrationFile} completed successfully`);
  } catch (error) {
    // Rollback the transaction on error
    await client.query('ROLLBACK');
    console.error(`Migration ${migrationFile} failed:`, error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

async function main() {
  try {
    // Get the migration file from command line arguments
    const migrationFile = process.argv[2];
    
    if (!migrationFile) {
      console.error('Please provide a migration file name');
      console.error('Usage: node run-migration.js <migration-file>');
      process.exit(1);
    }
    
    // Check if the migration file exists
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    // Run the migration
    await runMigration(migrationFile);
    
    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();
