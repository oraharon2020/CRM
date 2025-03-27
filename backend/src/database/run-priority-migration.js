const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration: add_priority_to_calendar_events.sql');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_priority_to_calendar_events.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Run the migration
    await client.query(migrationSql);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Migration completed successfully');
  } catch (error) {
    // Rollback the transaction on error
    await client.query('ROLLBACK');
    console.error('Error running migration:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration();
