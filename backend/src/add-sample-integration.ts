// Import the database module
import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

/**
 * Add a sample integration to the database
 */
async function addSampleIntegration(): Promise<void> {
  // Create a connection pool
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'global_crm',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000
  });

  try {
    console.log('Connecting to database...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('Database connection successful!');
    client.release();
    
    // Generate a random API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Create a sample integration
    console.log('\nCreating sample integration...');
    
    const elementorIntegration = {
      name: 'אלמנטור - דוגמה',
      type: 'elementor',
      api_key: apiKey,
      is_enabled: true,
      field_mapping: JSON.stringify({
        name: 'name',
        email: 'email',
        phone: 'phone',
        message: 'message'
      }),
      webhook_url: 'https://example.com/webhook'
    };
    
    // Insert the integration
    const result = await pool.query(`
      INSERT INTO integration_settings (
        name, 
        type, 
        api_key, 
        is_enabled, 
        field_mapping, 
        webhook_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      elementorIntegration.name,
      elementorIntegration.type,
      elementorIntegration.api_key,
      elementorIntegration.is_enabled,
      elementorIntegration.field_mapping,
      elementorIntegration.webhook_url
    ]);
    
    console.log(`Successfully created sample integration with ID: ${result.rows[0].id}`);
    
    // Create a sample Google Analytics integration
    console.log('\nCreating sample Google Analytics integration...');
    
    const gaApiKey = crypto.randomBytes(32).toString('hex');
    
    const gaIntegration = {
      name: 'Google Analytics - דוגמה',
      type: 'google-analytics',
      api_key: gaApiKey,
      is_enabled: true,
      field_mapping: JSON.stringify({
        tracking_id: 'UA-123456789-1',
        view_id: '123456789'
      })
    };
    
    // Insert the integration
    const gaResult = await pool.query(`
      INSERT INTO integration_settings (
        name, 
        type, 
        api_key, 
        is_enabled, 
        field_mapping
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      gaIntegration.name,
      gaIntegration.type,
      gaIntegration.api_key,
      gaIntegration.is_enabled,
      gaIntegration.field_mapping
    ]);
    
    console.log(`Successfully created sample Google Analytics integration with ID: ${gaResult.rows[0].id}`);
    
    // Verify the integrations were created
    const integrations = await pool.query('SELECT * FROM integration_settings');
    
    console.log(`\nTotal integrations in database: ${integrations.rows.length}`);
    console.table(integrations.rows);
    
  } catch (error) {
    console.error('Error adding sample integration:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the function
addSampleIntegration();
