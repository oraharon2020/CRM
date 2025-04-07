const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Adding default_store_id to users table...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_default_store_id_to_users.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Run the migration
    await client.query(migrationSQL);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    // Rollback the transaction if there's an error
    await client.query('ROLLBACK');
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    // Release the client
    client.release();
    
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration();
