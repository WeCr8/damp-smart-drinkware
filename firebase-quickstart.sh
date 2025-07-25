#!/bin/bash

# DAMP Smart Drinkware - Firebase Quick Start Script
# This script automates the Firebase setup process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔥 DAMP Smart Drinkware - Firebase Quick Start${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    echo -e "${YELLOW}Please install it with: npm install -g firebase-tools${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js from: https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}🔐 Please log in to Firebase...${NC}"
    firebase login
fi

echo -e "${GREEN}✅ Firebase authentication verified${NC}"
echo ""

# Install script dependencies
echo -e "${BLUE}📦 Installing script dependencies...${NC}"
cd scripts
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ scripts/package.json not found${NC}"
    exit 1
fi

npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Initialize Firebase project
echo -e "${BLUE}🚀 Initializing Firebase project...${NC}"
if [ ! -f "firebase.json" ]; then
    echo -e "${YELLOW}⚠️ firebase.json not found. Running firebase init...${NC}"
    firebase init
else
    echo -e "${GREEN}✅ Firebase already initialized${NC}"
fi

# Initialize database
echo -e "${BLUE}🗄️ Initializing Firestore database...${NC}"
node scripts/firebase-init.js

# Deploy security rules
echo -e "${BLUE}🛡️ Deploying Firestore security rules...${NC}"
firebase deploy --only firestore:rules

# Deploy indexes
echo -e "${BLUE}📇 Deploying Firestore indexes...${NC}"
firebase deploy --only firestore:indexes

# Start emulators
echo -e "${BLUE}🧪 Starting Firebase emulators...${NC}"
echo -e "${YELLOW}This will start the emulators in the background${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop them when you're done testing${NC}"
echo ""

# Create a simple test page
echo -e "${BLUE}🌐 Your application will be available at:${NC}"
echo -e "${CYAN}   Homepage: http://localhost:5000/${NC}"
echo -e "${CYAN}   Product Voting: http://localhost:5000/pages/product-voting.html${NC}"
echo -e "${CYAN}   Firebase UI: http://localhost:4000/${NC}"
echo ""

echo -e "${GREEN}🎉 Firebase setup completed successfully!${NC}"
echo ""
echo -e "${CYAN}📋 What you can test now:${NC}"
echo -e "${YELLOW}   1. Newsletter signup on homepage${NC}"
echo -e "${YELLOW}   2. Product voting system${NC}"
echo -e "${YELLOW}   3. Email capture after voting${NC}"
echo -e "${YELLOW}   4. Admin functions (login: admin@dampdrink.com / DampAdmin123!)${NC}"
echo ""
echo -e "${CYAN}💡 Useful commands:${NC}"
echo -e "${BLUE}   firebase emulators:start    ${NC}# Start emulators"
echo -e "${BLUE}   firebase deploy             ${NC}# Deploy to production"
echo -e "${BLUE}   firebase console            ${NC}# Open Firebase console"
echo ""

# Ask if user wants to start emulators now
read -p "Start Firebase emulators now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Starting Firebase emulators...${NC}"
    firebase emulators:start
else
    echo -e "${YELLOW}ℹ️ To start emulators later, run: firebase emulators:start${NC}"
fi

echo -e "${GREEN}✅ Setup complete! Happy coding! 🚀${NC}" 