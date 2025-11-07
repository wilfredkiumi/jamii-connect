# Jamii Connect - Kenyan Diaspora UK Platform

A modern Progressive Web App (PWA) connecting the Kenyan diaspora in the UK through jobs, events, community discussions, and services.

## 🎨 Design Philosophy: 60/30/10 Rule

This design follows the professional 60/30/10 color distribution rule:
- **60% Neutral** (whites, grays) - Creates breathing room and professional feel
- **30% Secondary** (soft greens, warm beiges) - Adds visual interest without overwhelming
- **10% Accent** (Kenyan flag green) - Reserved for CTAs and key actions only

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Backend**: AWS Amplify + Serverless Architecture
- **Database**: AWS DynamoDB (NoSQL with GSIs)
- **Authentication**: AWS Cognito (User Pools + Identity Pools)
- **API**: AWS Lambda + API Gateway (REST API)
- **Storage**: AWS S3 + CloudFront (CDN)
- **Infrastructure**: AWS CDK (Infrastructure as Code)
- **Deployment**: AWS Amplify / Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.17 or later
- npm, yarn, or pnpm
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/jamii-connect.git
cd jamii-connect
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your AWS credentials:
```env
# AWS Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1

# AWS API Gateway
NEXT_PUBLIC_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For local development with AWS SDK
AWS_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. AWS Infrastructure Setup

1. Install AWS CDK CLI:
```bash
npm install -g aws-cdk
```

2. Configure AWS credentials:
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and preferred region
```

3. Deploy the infrastructure:
```bash
cd infrastructure
npm install
cdk bootstrap  # One-time setup for your AWS account
cdk deploy     # Deploy all resources (DynamoDB, Lambda, API Gateway, Cognito, S3)
```

4. After deployment, copy the output values to your `.env.local`:
   - UserPoolId
   - UserPoolClientId
   - IdentityPoolId
   - ApiEndpoint

See `infrastructure/README.md` for detailed deployment instructions.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
jamii-connect/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── jobs/page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── services/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Header, Footer, MobileNav
│   │   └── features/     # PostCard, JobCard, EventCard
│   └── lib/
│       ├── amplify/      # AWS Amplify config & data access
│       ├── utils.ts
│       └── *-data.ts     # Static data files
├── infrastructure/
│   ├── lib/
│   │   └── jamii-connect-stack.ts  # AWS CDK stack
│   └── lambda/           # Lambda function handlers
│       ├── jobs/
│       ├── events/
│       ├── posts/
│       └── file-upload/
├── database/
│   └── dynamodb-tables.yaml  # DynamoDB schema
└── public/
```

## 🎯 Features Implemented

### ✅ Core Infrastructure
- [x] Next.js 15 with App Router + React 19
- [x] TypeScript configuration
- [x] Tailwind CSS 4 with custom Kenyan theme
- [x] shadcn/ui component library
- [x] AWS Amplify integration with SSR
- [x] AWS Cognito authentication
- [x] Authentication middleware
- [x] AWS CDK infrastructure (fully defined)
- [x] DynamoDB data access layer (complete)

### ✅ Authentication System
- [x] Login page with email/password
- [x] Signup page with profile creation
- [x] Protected routes middleware
- [x] Session management

### ✅ Landing Page
- [x] Hero section with Kenyan branding
- [x] Features showcase
- [x] Community testimonials
- [x] Call-to-action sections
- [x] Responsive design

### ✅ Database Schema (DynamoDB)
- [x] Users table with profile data
- [x] Posts table with GSI for category queries
- [x] Jobs table with GSI for location/type queries
- [x] Events table with date-based GSI
- [x] Services table with category GSI
- [x] Connections table for user relationships
- [x] Lambda functions for all CRUD operations

## 🔄 Next Steps for Remote Agents

The following features are ready to be implemented:

### 🚧 Dashboard & Community Feed
- [ ] Community posts display
- [ ] Post creation and editing
- [ ] Like and comment functionality
- [ ] Real-time updates
- [ ] Search and filtering

### 🚧 Jobs Board
- [ ] Job listings with search/filter
- [ ] Job posting form
- [ ] Application tracking
- [ ] Employer profiles

### 🚧 User Profile Management
- [ ] Profile editing interface
- [ ] Skills and interests management
- [ ] Avatar upload
- [ ] Privacy settings

### 🚧 Events System
- [ ] Event listings
- [ ] Event creation
- [ ] RSVP functionality
- [ ] Calendar integration

### 🚧 Services Directory
- [ ] Service provider listings
- [ ] Verification system
- [ ] Reviews and ratings
- [ ] Contact management

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow the existing component structure
- Use the custom color classes (text-accent-green, bg-secondary-green, etc.)
- Implement responsive design for all components

### Database Operations
- Use data access functions from `@/lib/amplify/data-access.ts`
- All DynamoDB operations include proper error handling
- Leverage GSIs for efficient queries
- Use pagination for large result sets
- Handle errors gracefully with user-friendly messages

### UI/UX Guidelines
- Follow the 60/30/10 color rule
- Use shadcn/ui components when possible
- Maintain consistent spacing and typography
- Ensure accessibility standards

## 📚 API Documentation

### DynamoDB Tables

#### Users
- User profile information linked to Cognito auth
- PK: `userId`, GSI: `email`
- Fields: username, full_name, bio, location, skills, looking_for, avatar_url

#### Posts
- Community discussions and posts
- PK: `postId`, SK: `userId`, GSI: `category`
- Fields: title, content, category, tags, likes_count, comments_count

#### Jobs
- Job board listings
- PK: `jobId`, SK: `postedBy`, GSI: `location`, GSI: `job_type`
- Fields: job_title, company_name, location, salary_range, requirements, diaspora_friendly

#### Events
- Community events
- PK: `eventId`, SK: `organizer_id`, GSI: `event_date`
- Fields: title, description, event_date, location_name, max_attendees, attendees_count

#### Services
- Service provider directory
- PK: `serviceId`, SK: `providerId`, GSI: `category`
- Fields: service_name, category, description, contact_info, verified

#### Connections
- User relationships and networking
- PK: `userId`, SK: `connectedUserId`
- Fields: status, created_at

### Lambda Functions

All CRUD operations are handled by Lambda functions at:
- `/infrastructure/lambda/jobs/` - Job board operations
- `/infrastructure/lambda/events/` - Event management
- `/infrastructure/lambda/posts/` - Post creation and retrieval
- `/infrastructure/lambda/services/` - Service directory
- `/infrastructure/lambda/users/` - User profile management
- `/infrastructure/lambda/connections/` - User connections
- `/infrastructure/lambda/file-upload/` - S3 file uploads

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the guidelines above
3. Test your changes thoroughly
4. Submit a pull request with a clear description

## 📞 Support

For questions or issues:
- Check the existing documentation
- Review the DynamoDB schema in `database/dynamodb-tables.yaml`
- Review Lambda functions in `infrastructure/lambda/`
- Test authentication flows with AWS Cognito
- Verify environment variables in `.env.local`

## 📄 License

This project is licensed under the MIT License.
