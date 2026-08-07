#!/bin/bash
git add .
# Use a default message if none is provided
msg="${1:-"Auto-commit: $(date +'%Y-%m-%d %H:%M:%S')"}"
git commit -m "$msg"
# Dynamically finds your current branch name
branch=$(git symbolic-ref --short HEAD)
git push origin "$branch"
