// Import required modules
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a connection pool for the local database
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',  // Default PostgreSQL user, change if needed
  password: '',      // Change to your local PostgreSQL password
  database: 'postgres', // Connect to default database first
  ssl: false
});

async function setupLocalDatabase() {
  let client;
  
  try {
    console.log('Setting up local database for testing...');
    
    // Connect to PostgreSQL
    client = await pool.connect();
    console.log('Connected to PostgreSQL server');
    
    // Create the database if it doesn't exist
    const dbName = 'global_crm_test';
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Created database: ${dbName}`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`Database ${dbName} already exists`);
      } else {
        throw error;
      }
    }
    
    // Release the client connected to 'postgres' database
    client.release();
    
    // Connect to the new database
    const dbPool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',  // Default PostgreSQL user, change if needed
      password: '',      // Change to your local PostgreSQL password
      database: dbName,
      ssl: false
    });
    
    client = await dbPool.connect();
    console.log(`Connected to database: ${dbName}`);
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await client.query(schema);
    console.log('Schema executed successfully');
    
    // Verify the database setup
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nCreated tables:');
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Create a .env.local file with the local database configuration
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    const envLocalContent = `# Local Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=${dbName}
`;
    
    fs.writeFileSync(envLocalPath, envLocalContent);
    console.log(`\nCreated .env.local file at: ${envLocalPath}`);
    console.log('To use the local database, run your application with:');
    console.log('NODE_ENV=local node src/index.js');
    
    console.log('\nLocal database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up local database:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the setup
setupLocalDatabase();
