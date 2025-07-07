#!/bin/bash

# Script to update frontend .env.local with deployed infrastructure outputs
# Usage: ./scripts/update-env.sh [environment]

set -e

ENVIRONMENT=${1:-dev}
OUTPUTS_FILE="outputs-${ENVIRONMENT}.json"
ENV_FILE="../.env.local"

echo "🔧 Updating environment variables from ${OUTPUTS_FILE}"

if [ ! -f "$OUTPUTS_FILE" ]; then
    echo "❌ Outputs file not found: $OUTPUTS_FILE"
    echo "Please run deployment first: ./scripts/deploy.sh ${ENVIRONMENT}"
    exit 1
fi

# Extract values from outputs file
STACK_NAME="JamiiConnectStack-${ENVIRONMENT}"

USER_POOL_ID=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.UserPoolId" | cut -d'"' -f4)
USER_POOL_CLIENT_ID=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.UserPoolClientId" | cut -d'"' -f4)
IDENTITY_POOL_ID=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.IdentityPoolId" | cut -d'"' -f4)
API_ENDPOINT=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.ApiEndpoint" | cut -d'"' -f4)
REGION=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.Region" | cut -d'"' -f4)
FILES_BUCKET=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.FilesBucketName" | cut -d'"' -f4)

# Table names
USERS_TABLE=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.UsersTableName" | cut -d'"' -f4)
POSTS_TABLE=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.PostsTableName" | cut -d'"' -f4)
JOBS_TABLE=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.JobsTableName" | cut -d'"' -f4)
EVENTS_TABLE=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.EventsTableName" | cut -d'"' -f4)
SERVICES_TABLE=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.ServicesTableName" | cut -d'"' -f4)
CONNECTIONS_TABLE=$(cat "$OUTPUTS_FILE" | grep "${STACK_NAME}.ConnectionsTableName" | cut -d'"' -f4)

# Backup existing .env.local if it exists
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📋 Backed up existing .env.local"
fi

# Create new .env.local file
cat > "$ENV_FILE" << EOF
# AWS Amplify Configuration - Generated from infrastructure deployment
# Environment: ${ENVIRONMENT}
# Generated on: $(date)

NEXT_PUBLIC_AWS_REGION=${REGION}
NEXT_PUBLIC_USER_POOL_ID=${USER_POOL_ID}
NEXT_PUBLIC_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID}
NEXT_PUBLIC_IDENTITY_POOL_ID=${IDENTITY_POOL_ID}
NEXT_PUBLIC_API_ENDPOINT=${API_ENDPOINT}

# DynamoDB Tables
NEXT_PUBLIC_USERS_TABLE=${USERS_TABLE}
NEXT_PUBLIC_POSTS_TABLE=${POSTS_TABLE}
NEXT_PUBLIC_JOBS_TABLE=${JOBS_TABLE}
NEXT_PUBLIC_EVENTS_TABLE=${EVENTS_TABLE}
NEXT_PUBLIC_SERVICES_TABLE=${SERVICES_TABLE}
NEXT_PUBLIC_CONNECTIONS_TABLE=${CONNECTIONS_TABLE}

# S3 Storage
NEXT_PUBLIC_FILES_BUCKET=${FILES_BUCKET}

# Environment
NEXT_PUBLIC_ENVIRONMENT=${ENVIRONMENT}
EOF

echo "✅ Environment variables updated in ${ENV_FILE}"
echo ""
echo "🔑 Configuration Summary:"
echo "   AWS Region: ${REGION}"
echo "   User Pool ID: ${USER_POOL_ID}"
echo "   API Endpoint: ${API_ENDPOINT}"
echo "   Files Bucket: ${FILES_BUCKET}"
echo ""
echo "📖 Your frontend is now configured to use the deployed infrastructure!"