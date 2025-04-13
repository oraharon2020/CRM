#!/bin/bash

# Compile TypeScript files
echo "Compiling TypeScript files..."
npx tsc

# Run the migration
echo "Running migration to add multi-supplier-manager type..."
node build/migrations/add-multi-supplier-manager-type.js

echo "Migration completed."
