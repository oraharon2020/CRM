#!/bin/bash

# This script initializes the stores in the database from the WooCommerceService
# It can be run directly to fix store-related issues without reinitializing the entire database

echo "Starting store initialization script..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo "Error: This script must be run from the backend directory."
  echo "Please run: cd newcrm/backend && ./init-stores.sh"
  exit 1
fi

# Check if TypeScript is installed
if command -v npx &> /dev/null && [ -f "node_modules/.bin/ts-node" ]; then
  echo "Using TypeScript version..."
  npx ts-node src/init-stores.ts
else
  echo "TypeScript not found, using JavaScript version..."
  node src/init-stores.js
fi

echo "Store initialization completed."
echo "You can now verify that the stores are properly initialized by checking the database or testing the API endpoints."
echo "See STORE_INITIALIZATION.md for more details."
