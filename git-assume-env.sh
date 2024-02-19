#!/bin/bash

# List of .env files
env_files=(
  "web/.env"
  "web/.env.local"
  "api-server/.env"
  "workflow-man/.env"
)

# Loop through all files and mark them as --assume-unchanged
for file in "${env_files[@]}"; do
  git update-index --assume-unchanged "$file"
done

echo "Environment files are set to --assume-unchanged."
