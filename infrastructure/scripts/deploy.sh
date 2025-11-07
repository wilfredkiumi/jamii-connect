#!/bin/bash

# Deployment script for Jamii Connect infrastructure
# Usage: ./scripts/deploy.sh [environment] [--frontend]

set -e

ENVIRONMENT=${1:-dev}
DEPLOY_FRONTEND=${2}

echo "🚀 Deploying Jamii Connect infrastructure for environment: ${ENVIRONMENT}"

# Check if required tools are installed
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Lambda layer dependencies
echo "📦 Installing Lambda layer dependencies..."
cd lambda-layers/utils/nodejs
npm install --production
cd ../../..

# Bootstrap CDK if needed
echo "🔧 Checking CDK bootstrap..."
npm run bootstrap

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Deploy infrastructure
echo "🚀 Deploying infrastructure..."
npm run cdk deploy -- \
    --context environment=${ENVIRONMENT} \
    --require-approval never \
    --outputs-file outputs-${ENVIRONMENT}.json

if [ $? -eq 0 ]; then
    echo "✅ Infrastructure deployment successful!"
    
    # Extract outputs
    if [ -f "outputs-${ENVIRONMENT}.json" ]; then
        echo "📋 Deployment outputs saved to outputs-${ENVIRONMENT}.json"
        
        # Display key outputs
        echo ""
        echo "🔑 Key Configuration Values:"
        cat outputs-${ENVIRONMENT}.json | grep -E "(UserPoolId|UserPoolClientId|IdentityPoolId|ApiEndpoint|Region)" | head -10
    fi
    
    # Deploy frontend if requested
    if [ "$DEPLOY_FRONTEND" == "--frontend" ]; then
        echo ""
        echo "🌐 Deploying frontend..."
        cd ..
        
        # Update environment variables with deployed infrastructure outputs
        ./infrastructure/scripts/update-env.sh ${ENVIRONMENT}
        
        # Build and deploy frontend
        npm run build
        
        # Upload to S3 (if using S3 deployment)
        if command -v aws s3 >/dev/null 2>&1; then
            BUCKET_NAME=$(cat infrastructure/outputs-${ENVIRONMENT}.json | grep FrontendBucketName | cut -d'"' -f4)
            if [ ! -z "$BUCKET_NAME" ]; then
                echo "📤 Uploading to S3 bucket: ${BUCKET_NAME}"
                aws s3 sync out/ s3://${BUCKET_NAME}/ --delete
                
                # Invalidate CloudFront if distribution exists
                DISTRIBUTION_ID=$(cat infrastructure/outputs-${ENVIRONMENT}.json | grep CloudFrontDistributionId | cut -d'"' -f4)
                if [ ! -z "$DISTRIBUTION_ID" ]; then
                    echo "🔄 Invalidating CloudFront distribution: ${DISTRIBUTION_ID}"
                    aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
                fi
            fi
        fi
        
        cd infrastructure
    fi
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📖 Next steps:"
    echo "   1. Update your .env.local file with the values from outputs-${ENVIRONMENT}.json"
    echo "   2. Test your API endpoints"
    echo "   3. Configure your frontend to use the new backend"
    
else
    echo "❌ Infrastructure deployment failed"
    exit 1
fi