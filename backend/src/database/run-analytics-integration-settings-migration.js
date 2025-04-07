const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
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
    console.log('Starting analytics integration settings migration...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Read and execute the SQL file
    const sqlFilePath = path.join(__dirname, 'migrations', 'add_analytics_integration_settings.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    await client.query(sqlContent);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Analytics integration settings migration completed successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error running analytics integration settings migration:', error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
