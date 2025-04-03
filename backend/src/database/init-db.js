// Import required modules
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

/**
 * Execute a query with parameters
 */
async function query(sql, params) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Initialize the database by running the schema.sql file
 */
async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Execute the entire schema as one statement
      // PostgreSQL can handle multiple statements in a single query
      await client.query(schema);
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Database schema initialized successfully!');
    } catch (error) {
      // Rollback the transaction if there's an error
      await client.query('ROLLBACK');
      console.error('Error executing schema:', error);
      throw error;
    } finally {
      // Release the client
      client.release();
    }
    
    // Verify the database was initialized correctly
    await verifyDatabaseSetup();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

/**
 * Verify that the database was set up correctly
 */
async function verifyDatabaseSetup() {
  try {
    // Check if the users table exists and has the admin user
    const users = await query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    
    if (users && users.length > 0) {
      console.log('Admin user verified successfully!');
    } else {
      console.warn('Admin user not found. Database may not be initialized correctly.');
    }
    
    // Check if the stores table exists and has sample data
    const stores = await query('SELECT COUNT(*) as count FROM stores');
    
    if (stores && stores.length > 0) {
      const storeCount = stores[0].count;
      console.log(`Found ${storeCount} stores in the database.`);
    } else {
      console.warn('Stores table may not be initialized correctly.');
    }
    
    // Check if the leads table exists and has sample data
    const leads = await query('SELECT COUNT(*) as count FROM leads');
    
    if (leads && leads.length > 0) {
      const leadCount = leads[0].count;
      console.log(`Found ${leadCount} leads in the database.`);
    } else {
      console.warn('Leads table may not be initialized correctly.');
    }
    
    console.log('Database verification completed.');
  } catch (error) {
    console.error('Error verifying database setup:', error);
    throw error;
  }
}

// Run the initialization function
initializeDatabase();
