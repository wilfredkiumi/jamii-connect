# Jamii Connect - Development Roadmap

This document outlines the remaining improvements and features to be implemented after backend deployment.

## ✅ Completed (Phase 0 - Foundation)

- [x] AWS DynamoDB architecture migration
- [x] TypeScript type definitions (`src/types/index.ts`)
- [x] Logger utility (`src/lib/logger.ts`)
- [x] Error boundary component (`src/components/ErrorBoundary.tsx`)
- [x] Loading skeleton components (`src/components/loading/LoadingSkeletons.tsx`)
- [x] Post creation page (`src/app/(main)/posts/create/page.tsx`)
- [x] Backend deployment guide (`DEPLOYMENT.md`)
- [x] Environment configuration template (`.env.example`)

## 🚧 Phase 1: Backend Integration (Priority: CRITICAL)

**Goal**: Connect frontend to deployed AWS backend

### 1.1 API Integration Layer
**Files to create**:
- `src/lib/api/client.ts` - API client with auth headers
- `src/lib/api/posts.ts` - Post API calls
- `src/lib/api/jobs.ts` - Job API calls
- `src/lib/api/events.ts` - Event API calls
- `src/lib/api/services.ts` - Service API calls
- `src/lib/api/users.ts` - User profile API calls

**What it does**:
```typescript
// Example: src/lib/api/client.ts
import { fetchAuthSession } from 'aws-amplify/auth'

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  return response.json()
}
```

### 1.2 Update Dashboard
**File**: `src/app/(main)/dashboard/page.tsx`

**Changes**:
- Remove mock data (lines 95-258)
- Replace with API calls to `/posts` endpoint
- Add error handling with retry logic
- Implement pagination/infinite scroll
- Show loading skeletons while fetching

### 1.3 Update Jobs Page
**File**: `src/app/(main)/jobs/page.tsx`

**Changes**:
- Remove mock job data (lines 102-223)
- Connect to `/jobs` API endpoint
- Implement filter query parameters
- Add loading states
- Handle empty states

### 1.4 Fix Profile Page
**File**: `src/app/(main)/profile/page.tsx`

**Changes**:
- Fetch user data from `/users/{userId}` on load
- Update profile via PUT `/users/{userId}`
- Remove localStorage, use backend
- Implement avatar upload to S3
- Add success/error notifications

### 1.5 Connect Job Posting
**File**: `src/app/(main)/jobs/post/page.tsx`

**Changes**:
- Uncomment API integration code (lines 207-213)
- Add authentication token
- Handle API errors properly
- Redirect to job detail page after success

**Estimated Time**: 2-3 days

---

## 🟠 Phase 2: Core Features (Priority: HIGH)

### 2.1 Notifications System

**Files to create**:
- `src/components/features/NotificationDropdown.tsx`
- `src/app/(main)/notifications/page.tsx`
- `src/lib/api/notifications.ts`

**Features**:
- Dropdown in header with unread count
- Real-time notification updates (polling or WebSocket)
- Mark as read functionality
- Notification types:
  - Connection requests
  - Post likes/comments
  - Job matches
  - Event reminders
  - System notifications

**Backend**:
- Create Lambda function for notifications
- Add Notifications DynamoDB table
- Set up EventBridge rules for scheduled notifications

### 2.2 Services Directory

**Files to update/create**:
- `src/app/(main)/services/page.tsx` - List page (enhance existing)
- `src/app/(main)/services/[id]/page.tsx` - Detail page
- `src/components/features/ServiceCard.tsx` - Service card component

**Features**:
- Filter by category, location, verified status
- Service provider profiles
- Contact forms
- Reviews and ratings (future)

### 2.3 Global Search

**Files**:
- `src/app/(main)/search/page.tsx` (enhance existing)
- `src/components/features/SearchBar.tsx`

**Features**:
- Search across posts, jobs, events, services, users
- Filter by type
- Recent searches
- Search suggestions

**Backend Consideration**:
- DynamoDB scans are expensive
- Consider adding ElasticSearch or
- Implement client-side filtering with cached data or
- Use DynamoDB GSIs creatively

### 2.4 Like & Comment System

**Files to create**:
- `src/components/features/CommentSection.tsx`
- `src/components/features/LikeButton.tsx`
- `src/lib/api/comments.ts`
- `src/lib/api/likes.ts`

**Features**:
- Like posts (toggle)
- Comment on posts
- Nested replies (optional)
- Comment likes
- Real-time count updates

**Backend**:
- Add Comments and Likes DynamoDB tables
- Create Lambda functions
- Add API routes

**Estimated Time**: 3-4 days

---

## 🟡 Phase 3: Social Features (Priority: MEDIUM)

### 3.1 User Connections

**Files**:
- `src/app/(main)/connections/page.tsx` (enhance existing stub)
- `src/app/(main)/users/[id]/page.tsx` - User profile view
- `src/components/features/ConnectionRequest.tsx`

**Features**:
- Send connection requests
- Accept/reject requests
- Connection list
- User search and discovery
- "People you may know" suggestions
- Mutual connections display

### 3.2 Event RSVP

**Files**:
- Update event detail pages
- `src/components/features/RSVPButton.tsx`
- `src/lib/api/events.ts` - Add RSVP methods

**Features**:
- RSVP status: Going, Interested, Not Going
- Attendee limit enforcement
- Waitlist when full
- Calendar export (.ics file)
- Reminder emails (via EventBridge + SES)

### 3.3 Messaging System (Optional)

**Approach 1**: Simple (Recommended for MVP)
- DynamoDB table for messages
- Polling for new messages
- Basic chat interface

**Approach 2**: Real-time
- AWS AppSync for GraphQL subscriptions
- Real-time message delivery
- Read receipts, typing indicators

**Files**:
- `src/app/(main)/messages/page.tsx`
- `src/components/features/ChatWindow.tsx`
- WebSocket or polling implementation

**Estimated Time**: 4-5 days

---

## 🟢 Phase 4: Polish & Optimization (Priority: MEDIUM)

### 4.1 Image Upload Improvements

**Files**:
- `src/components/features/ImageUpload.tsx`
- `src/lib/api/upload.ts`

**Features**:
- Drag and drop upload
- Image preview
- Compress before upload
- Progress indicator
- Multiple images support

**Backend**:
- S3 presigned URLs (already exists in Lambda)
- Image processing with Lambda (resize, optimize)

### 4.2 Loading States & Error Handling

**Updates across all pages**:
- Replace hardcoded skeletons with dynamic ones
- Add retry buttons on errors
- Implement optimistic UI updates
- Add empty states with CTAs

### 4.3 Form Validation

**Install**: `npm install react-hook-form @hookform/resolvers zod`

**Update forms to use**:
- React Hook Form for state management
- Zod for schema validation
- Better error messages
- Field-level validation

**Files to update**:
- All form pages (post creation, job posting, profile edit, etc.)

### 4.4 Replace console.log

**Search and replace across codebase**:
```bash
# Find all console.log usage
grep -r "console\.log" src/

# Replace with logger
# Before: console.log('User logged in')
# After: logger.info('User logged in')

# Before: console.error('Error:', error)
# After: logger.error('Error message', error)
```

**Estimated Time**: 2-3 days

---

## 🔵 Phase 5: Advanced Features (Priority: LOW)

### 5.1 Social Authentication

**File**: Update `src/app/(auth)/login/page.tsx` and `signup/page.tsx`

**Setup**:
1. Enable Google OAuth in AWS Cognito
2. Configure OAuth callback URLs
3. Add Google Client ID to Cognito
4. Update frontend auth flow

**Features**:
- Sign in with Google
- Sign in with Facebook (optional)
- LinkedIn (professional network integration)

### 5.2 Email Verification & Password Reset

**Backend**:
- Configure Cognito email templates
- Set up SES for email sending
- Custom email templates with branding

**Frontend**:
- Verification code entry page
- Forgot password flow
- Password reset page

**Files**:
- `src/app/(auth)/verify-email/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`

### 5.3 Admin Dashboard

**Files**:
- `src/app/(admin)/dashboard/page.tsx`
- `src/app/(admin)/users/page.tsx`
- `src/app/(admin)/content/page.tsx`
- `src/app/(admin)/reports/page.tsx`

**Features**:
- User management (suspend, delete)
- Content moderation (flag, remove)
- Analytics and metrics
- System settings

**Backend**:
- Add admin role in Cognito
- Admin-only API routes
- Audit logging

### 5.4 Analytics Integration

**Install**: `npm install @vercel/analytics`

**Files**:
- Update `src/app/layout.tsx`
- Create `src/lib/analytics.ts`

**Track**:
- Page views
- User actions (post created, job applied, etc.)
- Engagement metrics
- Conversion funnels

**Services to integrate**:
- Google Analytics 4
- Mixpanel (user behavior)
- Hotjar (heatmaps)

### 5.5 PWA Enhancements

**Features**:
- Offline support
- Push notifications
- Install prompt
- Background sync

**Files**:
- `public/manifest.json` (update)
- `public/sw.js` (service worker)
- Update Next.js config

### 5.6 Testing Infrastructure

**Install**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event vitest @vitejs/plugin-react
npm install -D playwright  # For E2E tests
```

**Test Coverage**:
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical flows (signup, post creation, job application)

**Files to create**:
- `__tests__/components/` - Component tests
- `__tests__/api/` - API integration tests
- `e2e/` - Playwright E2E tests

**Estimated Time**: 5-7 days

---

## 📊 Priority Matrix

| Feature | Priority | Impact | Effort | Status |
|---------|----------|--------|--------|--------|
| Backend Integration | 🔴 CRITICAL | HIGH | Medium | Phase 1 |
| Post Creation | 🔴 CRITICAL | HIGH | Low | ✅ Done |
| Notifications | 🟠 HIGH | HIGH | Medium | Phase 2 |
| Services Directory | 🟠 HIGH | MEDIUM | Medium | Phase 2 |
| Search | 🟠 HIGH | HIGH | Medium | Phase 2 |
| Comments & Likes | 🟠 HIGH | HIGH | Medium | Phase 2 |
| Connections | 🟡 MEDIUM | MEDIUM | High | Phase 3 |
| Event RSVP | 🟡 MEDIUM | MEDIUM | Low | Phase 3 |
| Image Upload | 🟢 LOW | LOW | Low | Phase 4 |
| Social Auth | 🟢 LOW | MEDIUM | Low | Phase 5 |
| Admin Dashboard | 🟢 LOW | LOW | High | Phase 5 |
| Testing | 🟢 LOW | HIGH | High | Phase 5 |

---

## 🎯 Quick Wins (Do First!)

These improvements take <1 hour each but make a big difference:

1. **Add Loading Spinners** - Replace static content with skeletons
2. **Fix TypeScript `any` Types** - Use proper types from `src/types/index.ts`
3. **Add Error Messages** - Better user feedback on form errors
4. **Empty States** - Add illustrations and CTAs when no data
5. **Toast Notifications** - Consistent success/error messages (already using Sonner)
6. **Button Loading States** - Disable and show spinner during API calls

---

## 🚀 Getting Started (Next Steps)

### After Backend Deployment:

1. **Test Backend**:
   ```bash
   # Verify all Lambda functions are working
   # Test API Gateway endpoints
   # Create test data in DynamoDB
   ```

2. **Implement API Client**:
   ```bash
   # Create src/lib/api/client.ts
   # Add authentication headers
   # Test with one endpoint (e.g., GET /posts)
   ```

3. **Update Dashboard**:
   ```bash
   # Replace mock data with API call
   # Add error handling
   # Test with real data
   ```

4. **Iterate Through Phases 1-5**

---

## 📞 Questions or Issues?

Refer to:
- `DEPLOYMENT.md` for backend setup
- `README.md` for project overview
- `docs/DEVELOPMENT_GUIDE.md` for coding guidelines
- Infrastructure code in `infrastructure/` directory

---

**Last Updated**: 2025-01-07
**Version**: 0.2.0
**Status**: Foundation Complete, Ready for Phase 1
