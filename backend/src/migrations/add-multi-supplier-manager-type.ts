#!/usr/bin/env node
import { pool } from '../config/database';

/**
 * Migration script to add 'multi-supplier-manager' to the integration_type enum
 */
async function addMultiSupplierManagerType() {
  try {
    console.log('Starting migration: Adding multi-supplier-manager to integration_type enum');
    
    // Check if the enum already has the value
    const checkQuery = `
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'integration_type'
      AND e.enumlabel = 'multi-supplier-manager';
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('multi-supplier-manager already exists in integration_type enum');
      return;
    }
    
    // Add the new value to the enum
    const alterEnumQuery = `
      ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'multi-supplier-manager';
    `;
    
    await pool.query(alterEnumQuery);
    
    console.log('Successfully added multi-supplier-manager to integration_type enum');
  } catch (error) {
    console.error('Error adding multi-supplier-manager to integration_type enum:', error);
    
    // If the error is because the enum is being used in a table, we need to use a different approach
    if (error.message && error.message.includes('cannot add value to enum type')) {
      console.log('Trying alternative approach...');
      
      try {
        // Create a new enum type with all the values
        const createNewEnumQuery = `
          -- Create a new enum type with all values including the new one
          CREATE TYPE integration_type_new AS ENUM (
            'elementor', 'contact-form-7', 'facebook', 'custom', 'generic',
            'google-ads', 'facebook-ads', 'google-analytics', 'google-search-console',
            'multi-supplier-manager'
          );
          
          -- Update the column to use the new type
          ALTER TABLE integration_settings 
          ALTER COLUMN type TYPE integration_type_new 
          USING type::text::integration_type_new;
          
          -- Drop the old type
          DROP TYPE integration_type;
          
          -- Rename the new type to the old name
          ALTER TYPE integration_type_new RENAME TO integration_type;
        `;
        
        await pool.query(createNewEnumQuery);
        console.log('Successfully updated integration_type enum using alternative approach');
      } catch (altError) {
        console.error('Error with alternative approach:', altError);
        throw altError;
      }
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Run the migration
addMultiSupplierManagerType()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
