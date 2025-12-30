#!/bin/bash

# Kill any existing server processes
echo "Stopping existing servers..."
pkill -f "tsx.*server/index" 2>/dev/null
pkill -f "node.*dist/index" 2>/dev/null
sleep 2

# Clear any build artifacts
echo "Cleaning build artifacts..."
rm -rf dist/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the development server
echo "Starting development server..."
cd /workspaces/tikjogos2
NODE_ENV=development npm run dev
