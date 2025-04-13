// Import the database module
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Check integrations in the database and categorize them
 */
async function checkIntegrationsCategories(): Promise<void> {
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
    
    // Query integration_settings
    console.log('\nRetrieving integrations from database...');
    
    const integrations = await pool.query('SELECT * FROM integration_settings');
    
    if (integrations.rows.length === 0) {
      console.log('No integrations found in the database.');
    } else {
      console.log(`Found ${integrations.rows.length} integrations in total:`);
      console.table(integrations.rows);
      
      // Categorize integrations
      const leadIntegrations = integrations.rows.filter(integration => 
        ['elementor', 'contact-form-7'].includes(integration.type)
      );
      
      const analyticsIntegrations = integrations.rows.filter(integration => 
        !['elementor', 'contact-form-7'].includes(integration.type)
      );
      
      // Display lead integrations
      console.log('\n=== LEAD INTEGRATIONS ===');
      if (leadIntegrations.length === 0) {
        console.log('No lead integrations found in the database.');
      } else {
        console.log(`Found ${leadIntegrations.length} lead integrations:`);
        console.table(leadIntegrations);
      }
      
      // Display analytics integrations
      console.log('\n=== ANALYTICS INTEGRATIONS ===');
      if (analyticsIntegrations.length === 0) {
        console.log('No analytics integrations found in the database.');
      } else {
        console.log(`Found ${analyticsIntegrations.length} analytics integrations:`);
        console.table(analyticsIntegrations);
      }
    }
    
    // Check if the table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'integration_settings'
      );
    `);
    
    console.log(`\nintegration_settings table exists: ${tableCheck.rows[0].exists}`);
    
  } catch (error) {
    console.error('Error checking integrations:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the check
checkIntegrationsCategories();
