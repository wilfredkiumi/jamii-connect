# Jamii Connect Infrastructure

This directory contains the AWS CDK infrastructure code for deploying the complete Jamii Connect backend services.

## Architecture Overview

The infrastructure includes:

- **Authentication**: AWS Cognito User Pool & Identity Pool for user management
- **Database**: DynamoDB tables with single-table design and GSI patterns
- **API**: API Gateway with Lambda functions for all backend operations
- **Storage**: S3 bucket with CloudFront CDN for file storage
- **Security**: IAM roles with least privilege access patterns

## Features

### 🔐 Authentication & Authorization
- Cognito User Pool with custom attributes for diaspora-specific fields
- Identity Pool for fine-grained AWS resource access
- JWT-based API authentication
- Row-level security through IAM policies

### 📊 Database Design
- Single-table DynamoDB design for optimal performance
- Global Secondary Indexes for efficient querying
- Support for complex access patterns (by location, category, status, etc.)
- Automatic scaling with pay-per-request billing

### 🚀 API Gateway & Lambda
- RESTful API with full CRUD operations
- Comprehensive Lambda functions for:
  - User management
  - Community posts with likes/comments
  - Job listings with applications
  - Events with RSVP functionality
  - Service provider directory
  - User connections/networking
  - File upload with S3 integration

### 📁 File Storage
- S3 bucket with organized folder structure (public/protected/private)
- CloudFront CDN for global content delivery
- Pre-signed URLs for secure uploads
- Automatic image optimization

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

## Quick Start

1. **Install dependencies:**
```bash
cd infrastructure
npm install
```

2. **Bootstrap CDK (first time only):**
```bash
npm run bootstrap
```

3. **Deploy to development:**
```bash
./scripts/deploy.sh dev
```

4. **Update frontend configuration:**
```bash
./scripts/update-env.sh dev
```

## Deployment

### Environment-specific Deployment

```bash
# Development
./scripts/deploy.sh dev

# Staging  
./scripts/deploy.sh staging

# Production
./scripts/deploy.sh prod
```

### Frontend Deployment (Optional)

```bash
# Deploy with frontend
./scripts/deploy.sh dev --frontend
```

### Manual CDK Commands

```bash
# Synthesize CloudFormation template
npm run synth

# Deploy with specific context
npm run cdk deploy -- --context environment=dev

# View diff before deployment
npm run diff

# Destroy infrastructure
./scripts/destroy.sh dev
```

## Configuration

### Environment Variables

Set these in your deployment environment:

```bash
# Required
CDK_DEFAULT_ACCOUNT=123456789012
CDK_DEFAULT_REGION=us-east-1

# Optional (for custom domains)
DEV_CERTIFICATE_ARN=arn:aws:acm:...
STAGING_CERTIFICATE_ARN=arn:aws:acm:...
PROD_CERTIFICATE_ARN=arn:aws:acm:...
```

### Environment-specific Settings

Each environment can be configured in `bin/app.ts`:

- **Account & Region**: AWS account and region for deployment
- **Domain**: Custom domain for the environment
- **Certificate**: ACM certificate ARN for HTTPS

## API Endpoints

After deployment, your API will be available at the endpoint shown in the outputs:

### Users API
- `GET /users` - List users with filters
- `GET /users/{userId}` - Get specific user
- `POST /users` - Create user profile
- `PUT /users/{userId}` - Update user profile
- `DELETE /users/{userId}` - Delete user

### Posts API
- `GET /posts` - List posts (feed)
- `POST /posts` - Create new post
- `PUT /posts/{postId}` - Update post
- `DELETE /posts/{postId}` - Delete post
- `POST /posts/{postId}/likes` - Like post
- `DELETE /posts/{postId}/likes` - Unlike post

### Jobs API
- `GET /jobs` - List jobs with filters
- `POST /jobs` - Create job posting
- `PUT /jobs/{jobId}` - Update job
- `DELETE /jobs/{jobId}` - Delete job
- `GET /jobs/{jobId}/applications` - List applications
- `POST /jobs/{jobId}/applications` - Apply for job

### Events API
- `GET /events` - List events with filters
- `POST /events` - Create event
- `PUT /events/{eventId}` - Update event
- `DELETE /events/{eventId}` - Delete event
- `GET /events/{eventId}/attendees` - List attendees
- `POST /events/{eventId}/attendees` - RSVP to event
- `DELETE /events/{eventId}/attendees` - Remove RSVP

### Services API
- `GET /services` - List services with filters
- `POST /services` - Create service listing
- `PUT /services/{serviceId}` - Update service
- `DELETE /services/{serviceId}` - Delete service

### Connections API
- `GET /connections` - List connections
- `POST /connections` - Send connection request
- `PUT /connections/{userId}` - Accept/reject request
- `DELETE /connections/{userId}` - Remove connection

### File Upload API
- `POST /upload/signed-url` - Get pre-signed upload URL

## Database Schema

### Single Table Design

All entities are stored in separate DynamoDB tables with the following patterns:

#### Users Table
- `PK`: `USER#{userId}`
- `SK`: `USER#{userId}`
- GSI1: `USER` / `{timestamp}` (list all users)
- GSI2: `LOCATION#{location}` / `{timestamp}` (users by location)

#### Posts Table
- `PK`: `POST#{postId}`
- `SK`: `POST#{postId}`
- GSI1: `POST` / `{timestamp}` (chronological feed)
- GSI2: `USER#{userId}` / `{timestamp}` (posts by user)
- GSI3: `CATEGORY#{category}` / `{timestamp}` (posts by category)

#### Jobs Table
- `PK`: `JOB#{jobId}`
- `SK`: `JOB#{jobId}`
- GSI1: `JOB#{status}` / `{timestamp}` (jobs by status)
- GSI2: `LOCATION#{location}` / `{timestamp}` (jobs by location)
- GSI3: `COMPANY#{company}` / `{timestamp}` (jobs by company)

### Related Items
- Job Applications: `PK`: `JOB#{jobId}`, `SK`: `APPLICATION#{userId}`
- Event Attendees: `PK`: `EVENT#{eventId}`, `SK`: `ATTENDEE#{userId}`
- Post Likes: `PK`: `POST#{postId}`, `SK`: `LIKE#{userId}`

## Security

### IAM Roles & Policies

- **Authenticated Users**: Can read/write their own data, read public data
- **Unauthenticated Users**: Read-only access to public resources
- **Lambda Functions**: Minimal permissions for their specific operations

### Data Protection

- All API endpoints require authentication (except public reads)
- Row-level security through DynamoDB conditions
- S3 bucket access controlled by user identity
- No sensitive data in logs or error messages

## Monitoring & Logging

### CloudWatch Integration

- API Gateway request/response logging
- Lambda function logs and metrics
- DynamoDB read/write metrics
- S3 access logs

### Error Handling

- Comprehensive error responses with appropriate HTTP codes
- Centralized error logging
- User-friendly error messages

## Cost Optimization

- **DynamoDB**: Pay-per-request billing mode
- **Lambda**: Efficient memory allocation (256MB for most functions)
- **S3**: Lifecycle policies for cost-effective storage
- **CloudFront**: Price class optimization for target regions

## Development

### Local Development

```bash
# Install Lambda layer dependencies
cd lambda-layers/utils/nodejs
npm install

# Build TypeScript
cd ../../..
npm run build

# Run tests (if available)
npm test
```

### Adding New API Endpoints

1. Add Lambda function in `lambda/{service}/index.ts`
2. Update `api-construct.ts` to include new endpoints
3. Add appropriate IAM permissions
4. Update this README with endpoint documentation

### Adding New Database Tables

1. Add table definition in `database-construct.ts`
2. Update GSI patterns as needed
3. Add table to environment variables
4. Update Lambda functions to use new table

## Troubleshooting

### Common Issues

1. **Bootstrap Error**: Run `npm run bootstrap` first
2. **Permission Denied**: Check AWS credentials and IAM permissions
3. **Stack Already Exists**: Use `npm run diff` to see changes
4. **Lambda Build Fails**: Ensure TypeScript compiles without errors

### Debug Mode

```bash
# Enable verbose CDK output
npm run cdk deploy -- --verbose

# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name JamiiConnectStack-dev
```

### Clean Up

```bash
# Remove all resources
./scripts/destroy.sh dev

# Remove CDK bootstrap (careful!)
aws cloudformation delete-stack --stack-name CDKToolkit
```

## Support

For issues with the infrastructure:

1. Check CloudWatch logs for Lambda function errors
2. Review API Gateway execution logs
3. Validate DynamoDB access patterns
4. Ensure IAM permissions are correct

## Contributing

1. Make changes in feature branches
2. Test with development environment first
3. Update documentation for any new features
4. Follow AWS best practices for security and cost optimization