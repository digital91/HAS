#!/bin/bash

echo "Starting HAS Cinema Website..."
echo

echo "Installing dependencies..."
npm run install-all

echo
echo "Starting development servers..."
echo "Frontend will run on http://localhost:3000"
echo "Backend will run on http://localhost:5000"
echo

npm run dev
