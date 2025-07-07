#!/bin/bash

# Destroy script for Jamii Connect infrastructure
# Usage: ./scripts/destroy.sh [environment]

set -e

ENVIRONMENT=${1:-dev}

echo "⚠️  WARNING: This will destroy ALL infrastructure for environment: ${ENVIRONMENT}"
read -p "Are you sure you want to proceed? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo "🗑️  Destroying Jamii Connect infrastructure for environment: ${ENVIRONMENT}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Destroy the CDK stack
npm run cdk destroy -- \
    --context environment=${ENVIRONMENT} \
    --force

if [ $? -eq 0 ]; then
    echo "✅ Infrastructure destruction completed!"
    
    # Clean up outputs file
    if [ -f "outputs-${ENVIRONMENT}.json" ]; then
        rm "outputs-${ENVIRONMENT}.json"
        echo "🧹 Cleaned up outputs file"
    fi
else
    echo "❌ Infrastructure destruction failed"
    exit 1
fi