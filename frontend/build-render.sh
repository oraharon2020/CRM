#!/bin/bash

# Install dependencies
npm install

# Build the frontend
npm run build

# Make the script executable
chmod +x build-render.sh
