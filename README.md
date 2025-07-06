# Jamii Connect - Kenyan Diaspora UK Platform

A modern Progressive Web App (PWA) connecting the Kenyan diaspora in the UK through jobs, events, community discussions, and services.

## 🎨 Design Philosophy: 60/30/10 Rule

This design follows the professional 60/30/10 color distribution rule:
- **60% Neutral** (whites, grays) - Creates breathing room and professional feel
- **30% Secondary** (soft greens, warm beiges) - Adds visual interest without overwhelming
- **10% Accent** (Kenyan flag green) - Reserved for CTAs and key actions only

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Deployment**: Vercel (seamless Next.js integration)

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

2. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema in your Supabase SQL editor:
```bash
# Copy the contents of supabase/schema.sql and run it in Supabase SQL editor
```

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
│   │   │   └── profile/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/
│   │   └── features/
│   └── lib/
│       └── supabase/
├── types/
│   └── database.ts
├── supabase/
│   └── schema.sql
└── public/
```

## 🎯 Features Implemented

### ✅ Core Infrastructure
- [x] Next.js 14 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS with custom Kenyan theme
- [x] shadcn/ui component library
- [x] Supabase integration with SSR
- [x] Authentication middleware

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

### ✅ Database Schema
- [x] User profiles table
- [x] Posts/discussions table
- [x] Jobs board table
- [x] Events table
- [x] Services directory table
- [x] Row Level Security (RLS) policies

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
- Always use Row Level Security (RLS)
- Use the typed database client from `@/lib/supabase/client`
- Handle errors gracefully with user-friendly messages

### UI/UX Guidelines
- Follow the 60/30/10 color rule
- Use shadcn/ui components when possible
- Maintain consistent spacing and typography
- Ensure accessibility standards

## 📚 API Documentation

### Supabase Tables

#### profiles
- User profile information extending Supabase auth
- Fields: username, full_name, bio, location, skills, etc.

#### posts
- Community discussions and posts
- Fields: title, content, category, tags, likes_count

#### jobs
- Job board listings
- Fields: job_title, company_name, location, salary_range, requirements

#### events
- Community events
- Fields: title, description, event_date, location_name, max_attendees

#### services
- Service provider directory
- Fields: service_name, category, description, contact_info

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the guidelines above
3. Test your changes thoroughly
4. Submit a pull request with a clear description

## 📞 Support

For questions or issues:
- Check the existing documentation
- Review the Supabase schema
- Test authentication flows
- Verify environment variables

## 📄 License

This project is licensed under the MIT License.
