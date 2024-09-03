#!/bin/bash

# Check if both commit type and message were provided
if [ $# -lt 2 ]; then
  echo "Error: Insufficient arguments provided."
  echo "Usage: ./git-commit.sh <commit-type> <commit-message>"
  exit 1
fi

# Add all changes to the staging area
git add .

# Commit with the provided type and message
git commit -m "$1: $2"

# Push the commit to the current branch
git push origin $(git rev-parse --abbrev-ref HEAD)
