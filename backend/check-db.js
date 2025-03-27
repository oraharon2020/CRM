const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function checkDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Get all tables
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tables = await query(tablesQuery);
    
    console.log('Tables in the database:');
    console.log(tables.rows.map(row => row.table_name));
    
    // Check if woocommerce_stores table exists
    const wcStoresExists = tables.rows.some(row => row.table_name === 'woocommerce_stores');
    
    if (wcStoresExists) {
      console.log('\nChecking woocommerce_stores table data...');
      const wcStoresData = await query('SELECT * FROM woocommerce_stores');
      
      console.log('WooCommerce stores data:');
      console.log(wcStoresData.rows);
    } else {
      console.log('\nwoocommerce_stores table does not exist.');
    }
    
    // Check if stores table exists
    const storesExists = tables.rows.some(row => row.table_name === 'stores');
    
    if (storesExists) {
      console.log('\nChecking stores table data...');
      const storesData = await query('SELECT * FROM stores');
      
      console.log('Stores data:');
      console.log(storesData.rows);
    } else {
      console.log('\nstores table does not exist.');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
