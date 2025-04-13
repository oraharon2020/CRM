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
    console.log('Starting migration: Adding store_id to leads table...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if store_id column exists
    const checkColumnResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'store_id';
    `);
    
    if (checkColumnResult.rows.length === 0) {
      console.log('store_id column does not exist, adding it...');
      
      // Add store_id column
      await client.query(`
        ALTER TABLE leads ADD COLUMN store_id INT;
      `);
      
      // Check if foreign key constraint exists
      const checkConstraintResult = await client.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'leads' AND constraint_name = 'fk_leads_store';
      `);
      
      if (checkConstraintResult.rows.length === 0) {
        console.log('Foreign key constraint does not exist, adding it...');
        
        // Add foreign key constraint
        await client.query(`
          ALTER TABLE leads 
          ADD CONSTRAINT fk_leads_store 
          FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;
        `);
      } else {
        console.log('Foreign key constraint already exists, skipping...');
      }
      
      // Check if index exists
      const checkIndexResult = await client.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'leads' AND indexname = 'idx_leads_store_id';
      `);
      
      if (checkIndexResult.rows.length === 0) {
        console.log('Index does not exist, adding it...');
        
        // Create index
        await client.query(`
          CREATE INDEX idx_leads_store_id ON leads(store_id);
        `);
      } else {
        console.log('Index already exists, skipping...');
      }
      
      console.log('Migration completed successfully!');
    } else {
      console.log('store_id column already exists, skipping migration...');
    }
    
    // Commit transaction
    await client.query('COMMIT');
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
