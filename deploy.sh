#!/bin/bash

# HAS Cinema Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting HAS Cinema deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Navigate to project directory
PROJECT_DIR=$(pwd)
echo -e "${GREEN}📂 Project directory: $PROJECT_DIR${NC}"

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo ""
    echo -e "${YELLOW}📥 Pulling latest code from Git...${NC}"
    git pull origin main || git pull origin master || echo "⚠️  Git pull skipped (not a git repo or no remote)"
fi

# Install root dependencies
echo ""
echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
npm install

# Install server dependencies
echo ""
echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
cd server
npm install --production
cd ..

# Install client dependencies
echo ""
echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
cd client
npm install
cd ..

# Build React app
echo ""
echo -e "${YELLOW}🏗️  Building React application...${NC}"
cd client
npm run build
cd ..

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo -e "${RED}❌ Error: Build failed! client/build directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Restart PM2
echo ""
echo -e "${YELLOW}🔄 Restarting PM2 application...${NC}"
cd server

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ Error: PM2 is not installed. Please install it first: npm install -g pm2${NC}"
    exit 1
fi

# Restart or start the application
if pm2 list | grep -q "has-cinema-server"; then
    pm2 restart has-cinema-server
    echo -e "${GREEN}✅ Application restarted!${NC}"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo -e "${GREEN}✅ Application started!${NC}"
fi

# Show PM2 status
echo ""
echo -e "${GREEN}📊 PM2 Status:${NC}"
pm2 status

# Show recent logs
echo ""
echo -e "${YELLOW}📋 Recent logs (last 20 lines):${NC}"
pm2 logs has-cinema-server --lines 20 --nostream

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs has-cinema-server"
echo "  - Monitor: pm2 monit"
echo "  - Status: pm2 status"
echo "  - Restart: pm2 restart has-cinema-server"
echo ""

