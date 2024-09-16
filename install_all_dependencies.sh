#!/bin/bash

# Install R dependencies
echo "Installing R dependencies..."
Rscript install_dependencies.R

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Install Playwright
echo "Installing Playwright..."
npx playwright install

echo "All dependencies installed successfully!"