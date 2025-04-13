#!/bin/bash

# Database connection details
DB_HOST="dpg-cv4avo5ds78s73ds7gjg-a.frankfurt-postgres.render.com"
DB_NAME="global_crm_db"
DB_USER="global_crm_db_user"
DB_PASSWORD="55rMFvN3oVFfogjLSmBE75uqhX06C5zq"

# Check if the enum already has the value
echo "Checking if multi-supplier-manager already exists in integration_type enum..."
CHECK_RESULT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "
  SELECT e.enumlabel
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'integration_type'
  AND e.enumlabel = 'multi-supplier-manager';
")

if [ -n "$CHECK_RESULT" ]; then
  echo "multi-supplier-manager already exists in integration_type enum"
  exit 0
fi

# Try to add the new value to the enum
echo "Adding multi-supplier-manager to integration_type enum..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
  ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'multi-supplier-manager';
" 2>/dev/null; then
  echo "Successfully added multi-supplier-manager to integration_type enum"
  exit 0
fi

# If the above fails, try the alternative approach
echo "First approach failed. Trying alternative approach..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
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
"

if [ $? -eq 0 ]; then
  echo "Successfully updated integration_type enum using alternative approach"
  exit 0
else
  echo "Migration failed"
  exit 1
fi
