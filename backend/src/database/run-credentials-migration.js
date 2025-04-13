const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Adding credentials and settings to integration_settings table...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_credentials_to_integration_settings.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Run the migration
    await client.query(migrationSQL);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});
