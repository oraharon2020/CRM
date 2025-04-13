const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'newcrm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting analytics tables migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_analytics_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute the migration SQL
    await client.query(migrationSQL);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Analytics tables migration completed successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error running analytics tables migration:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
    
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
