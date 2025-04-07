/**
 * Run Smart Cache Migration Script
 * 
 * This script directly executes the SQL migration to add smart cache fields
 * to the cash_flow table.
 * 
 * Usage: node run-migration.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  console.log('Starting database migration for smart caching...');
  console.log('Environment:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL || 'not set',
  });
  
  // Create database connection
  // Force SSL mode to be true with rejectUnauthorized: false to avoid certificate validation issues
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'global_crm',
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Connect to database
    const client = await pool.connect();
    console.log('Connected to database successfully');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add_smart_cache_fields_to_cash_flow.sql');
    console.log(`Reading migration from: ${migrationPath}`);
    
    let migrationSQL;
    try {
      migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log('Migration SQL loaded');
    } catch (err) {
      console.error('Error reading migration file:', err);
      process.exit(1);
    }

    // Execute the migration
    console.log('Executing migration...');
    await client.query(migrationSQL);
    console.log('Migration executed successfully');

    // Check the structure of the cash_flow table to confirm the migration worked
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cash_flow' 
      ORDER BY ordinal_position;
    `);

    console.log('\nCash flow table structure after migration:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });

    // Release the client
    client.release();
    console.log('\nMigration completed successfully');

  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);
