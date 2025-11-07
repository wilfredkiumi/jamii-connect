#!/bin/bash

# Deploy DynamoDB tables to AWS
# Usage: ./scripts/deploy-tables.sh [environment]

set -e

ENVIRONMENT=${1:-dev}
STACK_NAME="jamii-connect-dynamodb-${ENVIRONMENT}"

echo "🚀 Deploying DynamoDB tables for environment: ${ENVIRONMENT}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Deploy the CloudFormation stack
aws cloudformation deploy \
    --template-file database/dynamodb-tables.yaml \
    --stack-name ${STACK_NAME} \
    --parameter-overrides Environment=${ENVIRONMENT} \
    --capabilities CAPABILITY_IAM \
    --region ${AWS_DEFAULT_REGION:-us-east-1}

if [ $? -eq 0 ]; then
    echo "✅ DynamoDB tables deployed successfully!"
    echo "📋 Stack Name: ${STACK_NAME}"
    echo "🌍 Environment: ${ENVIRONMENT}"
    
    # Get the table names
    echo ""
    echo "📊 Table Names:"
    aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`UsersTableName`].OutputValue' \
        --output text --region ${AWS_DEFAULT_REGION:-us-east-1} | sed 's/^/  Users: /'
    
    aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`PostsTableName`].OutputValue' \
        --output text --region ${AWS_DEFAULT_REGION:-us-east-1} | sed 's/^/  Posts: /'
    
    aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`JobsTableName`].OutputValue' \
        --output text --region ${AWS_DEFAULT_REGION:-us-east-1} | sed 's/^/  Jobs: /'
    
    aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`EventsTableName`].OutputValue' \
        --output text --region ${AWS_DEFAULT_REGION:-us-east-1} | sed 's/^/  Events: /'
    
    aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`ServicesTableName`].OutputValue' \
        --output text --region ${AWS_DEFAULT_REGION:-us-east-1} | sed 's/^/  Services: /'
    
    aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`ConnectionsTableName`].OutputValue' \
        --output text --region ${AWS_DEFAULT_REGION:-us-east-1} | sed 's/^/  Connections: /'
else
    echo "❌ Failed to deploy DynamoDB tables"
    exit 1
fi