#!/bin/bash

# Install dependencies
npm install

# Compile TypeScript using the less strict config
npx tsc -p tsconfig.render.json

# Make the script executable
chmod +x build-render.sh
