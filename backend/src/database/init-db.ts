import fs from 'fs';
import path from 'path';
import { pool, query } from '../config/database';
import dotenv from 'dotenv';
import { integrationSettingsModel } from '../models/integration-settings.model';
import productCacheModel from '../models/product-cache.model';
import productCacheService from '../services/product-cache.service';
import { calendarEventModel } from '../models/calendar-event.model';
import { analyticsCampaignModel } from '../models/analytics-campaign.model';
import { analyticsPerformanceModel } from '../models/analytics-performance.model';
import { analyticsAlertModel } from '../models/analytics-alert.model';
import { analyticsSyncLogModel } from '../models/analytics-sync-log.model';
// TODO: Uncomment when cash-flow.model.ts and fixed-expense.model.ts are implemented
// import cashFlowModel from '../models/cash-flow.model';
// import fixedExpenseModel from '../models/fixed-expense.model';
import { employeeSalaryModel } from '../models/employee-salary.model';
import { initializeStores } from '../init-stores';

dotenv.config();

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
    
    // Initialize integration settings tables
    await integrationSettingsModel.createTables();
    console.log('Integration settings tables initialized successfully!');
    
    // Initialize product cache table
    await productCacheModel.initTable();
    console.log('Product cache table initialized successfully!');
    
    // Initialize calendar events table
    await calendarEventModel.createTable();
    console.log('Calendar events table initialized successfully!');
    
    // Initialize analytics tables
    await analyticsCampaignModel.createTable();
    console.log('Analytics campaigns table initialized successfully!');
    
    await analyticsPerformanceModel.createTable();
    console.log('Analytics performance table initialized successfully!');
    
    await analyticsAlertModel.createTable();
    console.log('Analytics alerts table initialized successfully!');
    
    await analyticsSyncLogModel.createTable();
    console.log('Analytics sync logs table initialized successfully!');
    
    // Initialize cash flow tables
    // TODO: Uncomment when cash-flow.model.ts and fixed-expense.model.ts are implemented
    // await cashFlowModel.initTable();
    // console.log('Cash flow table initialized successfully!');
    
    // await fixedExpenseModel.initTable();
    // console.log('Fixed expenses table initialized successfully!');
    
    await employeeSalaryModel.createTable();
    console.log('Employee salaries table initialized successfully!');
    
    // Initialize stores from WooCommerceService
    console.log('Initializing stores from WooCommerceService...');
    await initializeStores(false);
    
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
    
    // Check if the integration_settings table exists
    try {
      const integrations = await query('SELECT COUNT(*) as count FROM integration_settings');
      
      if (integrations && integrations.length > 0) {
        const integrationCount = integrations[0].count;
        console.log(`Found ${integrationCount} integration settings in the database.`);
      } else {
        console.warn('Integration settings table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Integration settings table may not exist yet.');
    }
    
    // Check if the product_cache table exists
    try {
      const productCache = await query('SELECT COUNT(*) as count FROM product_cache');
      
      if (productCache && productCache.length > 0) {
        const cacheCount = productCache[0].count;
        console.log(`Found ${cacheCount} product cache entries in the database.`);
      } else {
        console.warn('Product cache table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Product cache table may not exist yet.');
    }
    
    // Check if the calendar_events table exists
    try {
      const calendarEvents = await query('SELECT COUNT(*) as count FROM calendar_events');
      
      if (calendarEvents && calendarEvents.length > 0) {
        const eventsCount = calendarEvents[0].count;
        console.log(`Found ${eventsCount} calendar events in the database.`);
      } else {
        console.warn('Calendar events table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Calendar events table may not exist yet.');
    }
    
    // Check if the analytics tables exist
    try {
      const analyticsCampaigns = await query('SELECT COUNT(*) as count FROM analytics_campaigns');
      
      if (analyticsCampaigns && analyticsCampaigns.length > 0) {
        const campaignsCount = analyticsCampaigns[0].count;
        console.log(`Found ${campaignsCount} analytics campaigns in the database.`);
      } else {
        console.warn('Analytics campaigns table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Analytics campaigns table may not exist yet.');
    }
    
    try {
      const analyticsPerformance = await query('SELECT COUNT(*) as count FROM analytics_performance');
      
      if (analyticsPerformance && analyticsPerformance.length > 0) {
        const performanceCount = analyticsPerformance[0].count;
        console.log(`Found ${performanceCount} analytics performance entries in the database.`);
      } else {
        console.warn('Analytics performance table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Analytics performance table may not exist yet.');
    }
    
    try {
      const analyticsAlerts = await query('SELECT COUNT(*) as count FROM analytics_alerts');
      
      if (analyticsAlerts && analyticsAlerts.length > 0) {
        const alertsCount = analyticsAlerts[0].count;
        console.log(`Found ${alertsCount} analytics alerts in the database.`);
      } else {
        console.warn('Analytics alerts table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Analytics alerts table may not exist yet.');
    }
    
    try {
      const analyticsSyncLogs = await query('SELECT COUNT(*) as count FROM analytics_sync_logs');
      
      if (analyticsSyncLogs && analyticsSyncLogs.length > 0) {
        const syncLogsCount = analyticsSyncLogs[0].count;
        console.log(`Found ${syncLogsCount} analytics sync logs in the database.`);
      } else {
        console.warn('Analytics sync logs table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Analytics sync logs table may not exist yet.');
    }
    
    // Check if the cash flow tables exist
    // TODO: Uncomment when cash-flow.model.ts and fixed-expense.model.ts are implemented
    // try {
    //   const cashFlow = await query('SELECT COUNT(*) as count FROM cash_flow');
    //   
    //   if (cashFlow && cashFlow.length > 0) {
    //     const cashFlowCount = cashFlow[0].count;
    //     console.log(`Found ${cashFlowCount} cash flow entries in the database.`);
    //   } else {
    //     console.warn('Cash flow table may not be initialized correctly.');
    //   }
    // } catch (error) {
    //   console.warn('Cash flow table may not exist yet.');
    // }
    // 
    // try {
    //   const fixedExpenses = await query('SELECT COUNT(*) as count FROM fixed_expenses');
    //   
    //   if (fixedExpenses && fixedExpenses.length > 0) {
    //     const fixedExpensesCount = fixedExpenses[0].count;
    //     console.log(`Found ${fixedExpensesCount} fixed expenses in the database.`);
    //   } else {
    //     console.warn('Fixed expenses table may not be initialized correctly.');
    //   }
    // } catch (error) {
    //   console.warn('Fixed expenses table may not exist yet.');
    // }
    
    try {
      const employeeSalaries = await query('SELECT COUNT(*) as count FROM employee_salaries');
      
      if (employeeSalaries && employeeSalaries.length > 0) {
        const employeeSalariesCount = employeeSalaries[0].count;
        console.log(`Found ${employeeSalariesCount} employee salaries in the database.`);
      } else {
        console.warn('Employee salaries table may not be initialized correctly.');
      }
    } catch (error) {
      console.warn('Employee salaries table may not exist yet.');
    }
    
    console.log('Database verification completed.');
  } catch (error) {
    console.error('Error verifying database setup:', error);
    throw error;
  }
}

// Run the initialization function if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
