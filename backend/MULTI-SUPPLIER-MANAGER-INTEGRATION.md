# Multi-Supplier Manager Integration

This document describes the changes made to support the Multi-Supplier Manager integration type in the CRM system.

## Changes Made

1. **Updated TypeScript Interface**
   - Added 'multi-supplier-manager' to the `IntegrationSettings` interface type definition in `src/models/integration-settings.model.ts`

2. **Updated Controller**
   - Added 'multi-supplier-manager' to the list of valid integration types in the `create` and `update` methods in `src/controllers/integration-settings.controller.ts`
   - Added specific instructions for the Multi-Supplier Manager integration in the `getInstructions` function
   - Updated the controller to handle the `config` field from the form and store it in the `settings` field in the database

3. **Updated Database Schema**
   - Created a migration script to add 'multi-supplier-manager' to the `integration_type` enum in the database
   - Updated the `createTables` method to include 'multi-supplier-manager' when creating the enum type for new installations

4. **Updated Frontend Form**
   - Simplified the `MultiSupplierManagerIntegrationForm.tsx` by removing the unnecessary API Secret field
   - Updated the form to check both `settings` and `config` fields when loading existing data

## Running the Migration

There are three ways to run the migration to add the 'multi-supplier-manager' type to the database:

### Option 1: Using TypeScript (Recommended)

```bash
cd newcrm/backend
chmod +x run-migration.sh
./run-migration.sh
```

This will:
1. Compile the TypeScript files
2. Run the migration script

### Option 2: Direct Database Update with psql

```bash
cd newcrm/backend
chmod +x run-migration-direct.sh
./run-migration-direct.sh
```

This script connects directly to the database using psql and runs the SQL commands to update the enum type.

### Option 3: Direct Database Update with Node.js

```bash
cd newcrm/backend
chmod +x run-db-update.sh
./run-db-update.sh
```

This script uses Node.js and the pg module to connect to the database and update the enum type.

## Checking Database Status

To check the current state of the database and verify that the changes were applied:

```bash
cd newcrm/backend
chmod +x run-check-integrations.sh
./run-check-integrations.sh
```

This will:
1. Connect to the database
2. Check if the 'multi-supplier-manager' type exists in the enum
3. List all existing integrations
4. Show any Multi-Supplier Manager integrations
5. Display the table structure

## Verifying the Changes

After running the migration, you should be able to:

1. Create a new Multi-Supplier Manager integration in the CRM
2. Edit existing Multi-Supplier Manager integrations
3. See the correct form fields and instructions for the integration

## Troubleshooting

If you encounter any issues:

1. **Database Connection Issues**
   - Check that the database connection details in the scripts are correct
   - Ensure that the database is accessible from your current network
   - Try using the Node.js script (run-db-update.sh) if psql is not installed

2. **TypeScript Compilation Issues**
   - Run `npx tsc --noEmit` to check for TypeScript errors
   - Fix any errors and try again

3. **Integration Creation Issues**
   - Check the browser console for any errors
   - Verify that the backend API is returning the correct response
   - Run the check-integrations.js script to verify the database state

## Database Connection Details

The database connection details used in the migration scripts are:

- Host: dpg-cv4avo5ds78s73ds7gjg-a.frankfurt-postgres.render.com
- Database: global_crm_db
- User: global_crm_db_user
- Password: 55rMFvN3oVFfogjLSmBE75uqhX06C5zq
- SSL: Required
