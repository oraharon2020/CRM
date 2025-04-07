/**
 * This script checks the structure of the stores table in the database
 */

const { pool, query } = require('./config/database');

async function checkTableStructure() {
  try {
    console.log('Checking database table structure...');
    
    // First check if the stores table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stores'
      );
    `;
    
    const tableExists = await query(tableExistsQuery);
    
    if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
      console.log('Stores table does not exist.');
      return;
    }
    
    console.log('Stores table exists, checking its structure...');
    
    // Get the table structure
    const tableStructureQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'stores'
      ORDER BY ordinal_position;
    `;
    
    const tableStructure = await query(tableStructureQuery);
    
    console.log('Stores table structure:');
    console.table(tableStructure);
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkTableStructure();
