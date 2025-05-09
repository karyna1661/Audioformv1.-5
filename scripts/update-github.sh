#!/bin/bash

# Script to update GitHub repository with documentation

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "Git could not be found. Please install git."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null
then
    echo "Not in a git repository. Please run this script from within your project directory."
    exit 1
fi

# Add the documentation files
git add docs/user-guide.md README.md CONTRIBUTING.md

# Commit the changes
git commit -m "Add comprehensive user documentation and system overview"

# Push to GitHub
# Uncomment the line below when ready to push
# git push origin main

echo "Documentation files have been committed."
echo "To push to GitHub, run: git push origin main"
