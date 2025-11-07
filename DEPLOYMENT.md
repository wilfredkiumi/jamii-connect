# Jamii Connect - Backend Deployment Guide

## 📋 Prerequisites

Before deploying the backend infrastructure, ensure you have:

- **AWS Account** with appropriate permissions
- **AWS CLI** configured with credentials
- **Node.js** 18.17+ and npm installed
- **AWS CDK CLI** installed globally: `npm install -g aws-cdk`
- **Git** for version control

## 🚀 Deployment Steps

### Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# You'll be prompted for:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (recommend: us-east-1)
# - Output format (recommend: json)
```

### Step 2: Bootstrap AWS CDK (One-time Setup)

```bash
# Bootstrap CDK in your AWS account and region
cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# Example:
cdk bootstrap aws://123456789012/us-east-1
```

This creates the necessary S3 bucket and IAM roles for CDK deployments.

### Step 3: Install Infrastructure Dependencies

```bash
cd infrastructure
npm install
```

### Step 4: Review Stack Configuration

Check `infrastructure/lib/jamii-connect-stack.ts` for:
- Table names
- Lambda configurations
- API Gateway settings
- S3 bucket configurations

### Step 5: Deploy the Stack

```bash
# From infrastructure/ directory

# Preview changes (optional but recommended)
cdk diff

# Deploy the stack
cdk deploy

# Or deploy with automatic approval
cdk deploy --require-approval never
```

**Deployment takes approximately 5-10 minutes.**

### Step 6: Save CloudFormation Outputs

After deployment, CDK will output important values:

```
Outputs:
JamiiConnectStack.UserPoolId = us-east-1_xxxxx
JamiiConnectStack.UserPoolClientId = xxxxxxxxxxxxx
JamiiConnectStack.IdentityPoolId = us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
JamiiConnectStack.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
JamiiConnectStack.S3BucketName = jamiiconnect-uploads-xxxxx
JamiiConnectStack.CloudFrontDomain = xxxxx.cloudfront.net
```

**⚠️ IMPORTANT: Copy these values!** You'll need them for the frontend configuration.

### Step 7: Configure Frontend Environment

Copy the outputs to your `.env.local` file:

```bash
# From project root
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxx
NEXT_PUBLIC_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 8: Test the Deployment

```bash
# From project root
npm run dev

# Open http://localhost:3000
# Try signing up a new user
# Test authentication flow
```

## 📊 Deployed Resources

After deployment, you'll have:

### 1. **Amazon Cognito**
- User Pool for authentication
- User Pool Client for web app
- Identity Pool for AWS resource access

### 2. **DynamoDB Tables**
- **Users** - User profiles and settings
- **Posts** - Community posts and discussions
- **Jobs** - Job board listings
- **Events** - Community events
- **Services** - Service provider directory
- **Connections** - User relationships

### 3. **Lambda Functions**
- **JobsFunction** - Job CRUD operations
- **EventsFunction** - Event management
- **PostsFunction** - Post creation and retrieval
- **ServicesFunction** - Service directory
- **UsersFunction** - User profile management
- **ConnectionsFunction** - User connections
- **FileUploadFunction** - S3 file uploads

### 4. **API Gateway**
- REST API with CORS enabled
- Routes mapped to Lambda functions
- Cognito authorizer configured

### 5. **S3 & CloudFront**
- S3 bucket for file uploads
- CloudFront CDN for fast delivery
- CORS configured for frontend access

## 🔧 Post-Deployment Configuration

### Create Admin User

```bash
# Create an admin user via AWS CLI
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_xxxxx \
  --username admin@jamiiconnect.co.uk \
  --user-attributes Name=email,Value=admin@jamiiconnect.co.uk \
  --temporary-password "TempPassword123!" \
  --region us-east-1

# Add user to admin group (if you create one)
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_xxxxx \
  --username admin@jamiiconnect.co.uk \
  --group-name Admins \
  --region us-east-1
```

### Enable DynamoDB Streams (Optional)

For real-time features, enable streams on DynamoDB tables:

```bash
aws dynamodb update-table \
  --table-name JamiiConnect-Posts-prod \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES \
  --region us-east-1
```

### Configure CloudWatch Alarms

Set up monitoring for:
- Lambda function errors
- API Gateway 5xx errors
- DynamoDB throttling
- Cognito failed login attempts

## 🧪 Testing the Backend

### Test API Endpoints

```bash
# Get authentication token first (sign in via frontend)
TOKEN="your-jwt-token"

# Test Jobs API
curl -X GET https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/jobs \
  -H "Authorization: Bearer $TOKEN"

# Test creating a post
curl -X POST https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post",
    "category": "general",
    "tags": ["test"]
  }'
```

### Test File Uploads

```bash
# Get upload URL
curl -X POST https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.jpg", "fileType": "image/jpeg"}'

# Use the returned presigned URL to upload file
curl -X PUT "PRESIGNED_URL" \
  -H "Content-Type: image/jpeg" \
  --upload-file test.jpg
```

## 📈 Monitoring & Logs

### View Lambda Logs

```bash
# View logs for a specific function
aws logs tail /aws/lambda/JamiiConnectStack-JobsFunction --follow --region us-east-1
```

### CloudWatch Dashboard

Access CloudWatch in AWS Console to view:
- API request metrics
- Lambda execution metrics
- DynamoDB capacity metrics
- Error rates

## 🔄 Updates & Redeployment

### Update Lambda Functions

```bash
cd infrastructure
npm install  # If dependencies changed
cdk deploy
```

CDK will automatically:
- Deploy new Lambda code
- Update API Gateway routes
- Apply DynamoDB changes
- Update IAM permissions

### Rollback

```bash
# List stack events
aws cloudformation describe-stack-events --stack-name JamiiConnectStack

# Rollback to previous version (if deployment failed)
aws cloudformation cancel-update-stack --stack-name JamiiConnectStack
```

## 🗑️ Cleanup (Destroy Stack)

**⚠️ WARNING: This will delete all data!**

```bash
cd infrastructure
cdk destroy

# Confirm when prompted
```

This will delete:
- All DynamoDB tables and data
- All Lambda functions
- API Gateway
- S3 bucket (if empty)
- Cognito User Pool and users
- CloudFront distribution

## 💰 Cost Estimation

Estimated monthly costs (assuming 1,000 active users):

- **DynamoDB**: ~$5-10 (on-demand pricing)
- **Lambda**: ~$5-15 (1M requests free tier)
- **API Gateway**: ~$3.50 (1M requests)
- **Cognito**: Free (up to 50,000 MAU)
- **S3**: ~$2-5 (storage + requests)
- **CloudFront**: ~$1-3 (data transfer)

**Total**: ~$15-40/month

Cost scales with usage. Enable CloudWatch billing alarms!

## 🔒 Security Best Practices

1. **Rotate Credentials**: Use AWS Secrets Manager for sensitive data
2. **Enable MFA**: For Cognito users
3. **CloudTrail**: Enable for audit logging
4. **WAF**: Add AWS WAF to API Gateway (optional)
5. **Encryption**: Enable at-rest encryption for S3 and DynamoDB
6. **Least Privilege**: Review IAM roles regularly
7. **API Rate Limiting**: Configure throttling on API Gateway

## 🐛 Troubleshooting

### Issue: CDK Deploy Fails

```bash
# Check AWS credentials
aws sts get-caller-identity

# Clear CDK cache
rm -rf cdk.out/
cdk synth

# Try deploy again
cdk deploy --verbose
```

### Issue: Lambda Function Errors

```bash
# View recent logs
aws logs tail /aws/lambda/FUNCTION_NAME --since 1h

# Test function directly
aws lambda invoke \
  --function-name JamiiConnectStack-JobsFunction \
  --payload '{"httpMethod":"GET","path":"/jobs"}' \
  response.json
```

### Issue: CORS Errors

Check API Gateway CORS configuration:
- Allowed Origins: Your frontend domain
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization

### Issue: Cognito Authentication Fails

- Verify User Pool ID and Client ID in `.env.local`
- Check User Pool App Client settings (no secret required for public clients)
- Verify callback URLs match your frontend domain

## 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Lambda Performance](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Cognito Security](https://docs.aws.amazon.com/cognito/latest/developerguide/security.html)

## 🆘 Support

For deployment issues:
1. Check CloudFormation events in AWS Console
2. Review Lambda logs in CloudWatch
3. Verify IAM permissions
4. Check AWS Service Health Dashboard
5. Contact AWS Support if needed

---

**Next Steps**: After successful deployment, proceed to connect the frontend components to the backend APIs. See `ROADMAP.md` for the implementation plan.
