#!/bin/bash
# Simple deployment script for ToDo-List app
# Build the production bundle (already built, but ensure up-to-date)
npm run build --silent

# Install serve globally if not present
if ! command -v serve &> /dev/null; then
  echo "Installing serve globally..."
  npm install -g serve
fi

# Serve the build folder locally on port 5000
serve -s build -l 5000
