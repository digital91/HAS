#!/bin/bash

# HAS Cinema VPS Setup Script
# This script automates the initial setup of VPS for HAS Cinema deployment
# Usage: ./setup-vps.sh

set -e

echo "🚀 HAS Cinema VPS Setup Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}⚠️  Running as root. Some commands may need adjustment.${NC}"
fi

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x LTS
echo ""
echo -e "${BLUE}📦 Installing Node.js 18.x LTS...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js already installed: $(node --version)${NC}"
fi

# Install PM2
echo ""
echo -e "${BLUE}📦 Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
    
    # Setup PM2 startup
    echo -e "${BLUE}⚙️  Setting up PM2 startup script...${NC}"
    PM2_STARTUP=$(pm2 startup | grep -o 'sudo.*')
    if [ ! -z "$PM2_STARTUP" ]; then
        eval $PM2_STARTUP
        echo -e "${GREEN}✅ PM2 startup configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 already installed${NC}"
fi

# Install Nginx
echo ""
echo -e "${BLUE}📦 Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installed and started${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx already installed${NC}"
fi

# Install Git
echo ""
echo -e "${BLUE}📦 Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    echo -e "${GREEN}✅ Git installed${NC}"
else
    echo -e "${YELLOW}⚠️  Git already installed: $(git --version)${NC}"
fi

# Install Certbot
echo ""
echo -e "${BLUE}📦 Installing Certbot (for SSL)...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installed${NC}"
else
    echo -e "${YELLOW}⚠️  Certbot already installed${NC}"
fi

# Install UFW (Firewall)
echo ""
echo -e "${BLUE}🔥 Configuring Firewall (UFW)...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    sudo apt install -y ufw
    sudo ufw --force enable
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    echo -e "${GREEN}✅ Firewall installed and configured${NC}"
fi

# Install Fail2Ban (optional but recommended)
echo ""
read -p "Install Fail2Ban for security? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v fail2ban-server &> /dev/null; then
        sudo apt install -y fail2ban
        sudo systemctl enable fail2ban
        sudo systemctl start fail2ban
        echo -e "${GREEN}✅ Fail2Ban installed and started${NC}"
    else
        echo -e "${YELLOW}⚠️  Fail2Ban already installed${NC}"
    fi
fi

# Summary
echo ""
echo -e "${GREEN}✅ VPS Setup Completed!${NC}"
echo ""
echo "Installed components:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - Git: $(git --version)"
echo ""
echo "Next steps:"
echo "  1. Clone your project: git clone <your-repo> ~/projects/cinemas-has"
echo "  2. Configure environment variables in server/config.env"
echo "  3. Run: cd ~/projects/cinemas-has && ./deploy.sh"
echo "  4. Configure Nginx with nginx-has-cinema.conf"
echo "  5. Get SSL certificate: sudo certbot --nginx -d yourdomain.com"
echo ""
echo -e "${BLUE}📚 See DEPLOYMENT-GUIDE.md for detailed instructions${NC}"

