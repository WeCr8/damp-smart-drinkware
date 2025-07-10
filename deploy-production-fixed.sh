#!/bin/bash

echo "🚀 DAMP Production Deployment - Fixed Version"

# Change to the correct directory
cd /c/Users/Zach/Documents/Projects/damp-smart-drinkware

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Check what we're about to commit
echo "📋 Files to be committed:"
git diff --cached --name-only

# Commit the changes
echo "💾 Committing changes..."
git commit -m "🚀 Production optimization: Fix robots.txt, optimize images (2.8MB→200KB), add favicon"

# Push to production
echo "🚀 Deploying to production..."
git push origin main

echo "✅ Deployment completed!"
echo "🔗 Check your site: https://damp-smart-drinkware.netlify.app" 