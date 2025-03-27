// Import the pg module directly
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'global_crm',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Database configuration:');
  console.log(`- Host: ${process.env.DB_HOST}`);
  console.log(`- Port: ${process.env.DB_PORT}`);
  console.log(`- Database: ${process.env.DB_NAME}`);
  console.log(`- User: ${process.env.DB_USER}`);
  console.log(`- SSL: ${process.env.DB_SSL}`);
  
  try {
    // Try to connect to the database
    const client = await pool.connect();
    console.log('Database connection successful!');
    
    // Run a simple query to verify the connection
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`Current database time: ${result.rows[0].current_time}`);
    
    // Release the client
    client.release();
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the test
testConnection();
