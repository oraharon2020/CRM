/**
 * Run the fix_store_id_in_leads migration
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../../config/database');

async function runMigration() {
  try {
    console.log('Running fix_store_id_in_leads migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'fix_store_id_in_leads.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Execute the migration
      await client.query(migration);
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Migration executed successfully!');
    } catch (error) {
      // Rollback the transaction if there's an error
      await client.query('ROLLBACK');
      console.error('Error executing migration:', error);
      throw error;
    } finally {
      // Release the client
      client.release();
    }
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration();
