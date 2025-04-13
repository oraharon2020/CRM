#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run this script."
    exit 1
fi

# Navigate to the backend directory
cd "$(dirname "$0")"

# Check if pg module is installed
if [ ! -d "node_modules/pg" ]; then
    echo "Installing pg module..."
    npm install pg
fi

# Run the check-stores.js script
echo "Running database check script..."
node check-stores.js

echo "Script execution completed."
