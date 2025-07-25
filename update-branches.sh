#!/bin/bash

# DAMP Smart Drinkware - Update All Branches Script
# Using development branch as source for new origin main HEAD

echo "🚀 DAMP Smart Drinkware - Updating All Branches from Development"
echo "================================================================="

# Ensure we're in the right directory
cd /c/Users/Zach/Documents/Projects/damp-smart-drinkware

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Fetch latest from origin
echo "🔄 Fetching latest changes..."
git fetch origin

# Ensure we're on development and it's up to date
echo "📦 Switching to development branch..."
git checkout development
git pull origin development

# Push development to ensure it's current
echo "📤 Pushing development branch..."
git push origin development

# Update main branch to match development
echo "🔄 Updating main branch to match development..."
git checkout main 2>/dev/null || git checkout -b main
git reset --hard development
git push origin main --force-with-lease

# Update staging branch
echo "🔄 Updating staging branch..."
git checkout staging 2>/dev/null || git checkout -b staging
git reset --hard development
git push origin staging --force-with-lease

# Update production branch
echo "🔄 Updating production branch..."
git checkout production 2>/dev/null || git checkout -b production
git reset --hard main
git push origin production --force-with-lease

# Set origin HEAD to main
echo "📌 Setting origin HEAD to main..."
git remote set-head origin main

# Return to development branch
echo "🏠 Returning to development branch..."
git checkout development

# Verify all branches
echo ""
echo "✅ Branch Update Summary:"
echo "========================"
git for-each-ref --format='%(refname:short) -> %(upstream:short)' refs/heads

echo ""
echo "🎉 All branches updated successfully!"
echo "   - development: Source branch (kept as-is)"
echo "   - main: Updated to match development"
echo "   - staging: Updated to match development" 
echo "   - production: Updated to match main"
echo "   - origin HEAD: Set to main"

echo ""
echo "🚀 Deployment completed successfully!" 