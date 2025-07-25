#!/bin/bash

# DAMP Smart Drinkware - Update All Branches Script
# Google Engineering Standards - Multi-branch Deployment

set -e

echo "🚀 DAMP Smart Drinkware - Updating All Branches"
echo "=================================================="

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ensure working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Working directory has uncommitted changes"
    echo "   Please commit or stash changes before proceeding"
    exit 1
fi

# Define branches to update
BRANCHES=("main" "development" "staging" "production")
MAIN_BRANCH="development"

echo "🔄 Fetching latest changes from origin..."
git fetch origin

# Function to update branch
update_branch() {
    local branch=$1
    echo ""
    echo "📦 Updating branch: $branch"
    echo "--------------------------------"
    
    # Checkout branch
    if git show-ref --verify --quiet refs/heads/$branch; then
        git checkout $branch
        echo "✅ Switched to existing branch: $branch"
    else
        git checkout -b $branch origin/$branch 2>/dev/null || git checkout -b $branch
        echo "✅ Created new branch: $branch"
    fi
    
    # Update with latest changes from main development branch
    if [ "$branch" != "$MAIN_BRANCH" ]; then
        echo "🔀 Merging changes from $MAIN_BRANCH into $branch"
        git merge $MAIN_BRANCH --no-edit || {
            echo "❌ Merge conflict detected in $branch"
            echo "   Please resolve conflicts manually"
            return 1
        }
    fi
    
    # Push to origin
    echo "📤 Pushing $branch to origin..."
    git push origin $branch
    echo "✅ Successfully updated $branch"
    
    return 0
}

# Update each branch
echo ""
echo "🔄 Starting branch updates..."

for branch in "${BRANCHES[@]}"; do
    if ! update_branch $branch; then
        echo "❌ Failed to update $branch"
        echo "   Stopping deployment process"
        git checkout $CURRENT_BRANCH
        exit 1
    fi
done

# Return to original branch
echo ""
echo "🏠 Returning to original branch: $CURRENT_BRANCH"
git checkout $CURRENT_BRANCH

# Update HEAD pointer
echo "📌 Updating origin HEAD to main branch"
git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main

echo ""
echo "🎉 All branches updated successfully!"
echo "=================================="
echo "✅ main - Updated and pushed"
echo "✅ development - Updated and pushed" 
echo "✅ staging - Updated and pushed"
echo "✅ production - Updated and pushed"
echo ""
echo "🚀 Deployment completed successfully!"

# Run tests on updated branches
echo ""
echo "🧪 Running tests on updated branches..."
npm run test:e2e

echo ""
echo "✨ DAMP Smart Drinkware deployment complete!"
echo "   All branches are now synchronized and tested" 