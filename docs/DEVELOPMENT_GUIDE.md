# Development Guide for Remote Agents

## 🎯 Quick Start Checklist

### Before You Begin
- [ ] Node.js 18.17+ installed
- [ ] Git configured with your credentials
- [ ] Code editor with TypeScript support
- [ ] Basic understanding of Next.js and React

### Setup Process
1. [ ] Clone the repository
2. [ ] Install dependencies (`npm install`)
3. [ ] Set up environment variables
4. [ ] Create Supabase project and run schema
5. [ ] Start development server (`npm run dev`)
6. [ ] Verify landing page loads at localhost:3000

## 🏗️ Architecture Overview

### File Structure Priority
Focus on these directories for development:

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Protected app pages
│   └── page.tsx         # Landing page ✅ COMPLETE
├── components/
│   ├── ui/              # shadcn/ui components ✅ COMPLETE
│   ├── layout/          # Header, Footer, Navigation
│   └── features/        # Feature-specific components
└── lib/
    └── supabase/        # Database client ✅ COMPLETE
```

### Key Technologies

**Frontend Stack:**
- Next.js 14 (App Router) - Server-side rendering
- TypeScript - Type safety
- Tailwind CSS - Styling with custom Kenyan theme
- shadcn/ui - Pre-built accessible components
- Lucide React - Icons

**Backend Stack:**
- Supabase - Database, Auth, Real-time
- PostgreSQL - Relational database
- Row Level Security - Data protection

## 🎨 Design System

### Color Usage (60/30/10 Rule)

**60% - Neutral Colors (Backgrounds)**
```css
bg-neutral-50    /* Main backgrounds */
bg-white         /* Cards and containers */
text-text-primary    /* Main text */
text-text-secondary  /* Secondary text */
```

**30% - Secondary Colors (Sections)**
```css
bg-secondary-green   /* Light green backgrounds */
bg-secondary-warmth  /* Warm beige sections */
```

**10% - Accent Colors (CTAs)**
```css
bg-accent-green      /* Primary buttons */
text-accent-green    /* Links and highlights */
hover:bg-green-700   /* Button hover states */
```

### Component Patterns

**Button Usage:**
```tsx
// Primary CTA
<Button className="bg-accent-green hover:bg-green-700 text-white">
  Primary Action
</Button>

// Secondary action
<Button variant="outline" className="border-neutral-300 text-text-primary">
  Secondary Action
</Button>
```

**Card Layout:**
```tsx
<Card className="bg-white border-neutral-200">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

## 🔐 Authentication Flow

### Current Implementation
- ✅ Login page (`/login`)
- ✅ Signup page (`/signup`)
- ✅ Middleware protection for authenticated routes
- ✅ Profile creation on signup

### Usage Examples

**Client-side auth:**
```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Server-side auth:**
```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

## 💾 Database Operations

### Table Relationships
```
auth.users (Supabase)
    ↓
profiles (1:1)
    ↓
posts (1:many)
jobs (1:many)
events (1:many)
services (1:many)
```

### Common Queries

**Fetch user profile:**
```tsx
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

**Create a post:**
```tsx
const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: user.id,
    title: 'Post Title',
    content: 'Post content...',
    category: 'general'
  })
```

**Fetch posts with profiles:**
```tsx
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    profiles!posts_user_id_fkey (
      full_name,
      avatar_url
    )
  `)
  .order('created_at', { ascending: false })
```

## 🚀 Development Workflow

### 1. Feature Development Process

1. **Create feature branch:**
```bash
git checkout -b feature/dashboard-posts
```

2. **Plan component structure:**
```
components/features/
├── PostCard.tsx
├── PostForm.tsx
└── PostList.tsx
```

3. **Implement with TypeScript:**
```tsx
interface Post {
  id: string
  title: string
  content: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
  }
}
```

4. **Test functionality:**
- Authentication flows
- Database operations
- UI responsiveness
- Error handling

### 2. Page Creation Template

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewPage() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
      
      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white border-neutral-200">
          <CardHeader>
            <CardTitle className="text-text-primary">Page Title</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Page content */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

**Authentication:**
- [ ] Signup creates user and profile
- [ ] Login redirects to dashboard
- [ ] Protected routes redirect to login
- [ ] Logout clears session

**UI/UX:**
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Color scheme follows 60/30/10 rule
- [ ] Loading states are shown
- [ ] Error messages are user-friendly

**Database:**
- [ ] RLS policies prevent unauthorized access
- [ ] Data validation works correctly
- [ ] Real-time updates function (if implemented)

## 🐛 Common Issues & Solutions

### Environment Variables
**Issue:** Supabase connection fails
**Solution:** Verify `.env.local` has correct values from Supabase dashboard

### TypeScript Errors
**Issue:** Database type errors
**Solution:** Check `types/database.ts` matches your Supabase schema

### Styling Issues
**Issue:** Custom colors not working
**Solution:** Use the predefined classes in `globals.css`

### Authentication
**Issue:** User not persisting across page refreshes
**Solution:** Check middleware.ts configuration

## 📋 Priority Features for Implementation

### High Priority (Week 1-2)
1. **Dashboard Page** (`/dashboard`)
   - Community feed with posts
   - Quick actions sidebar
   - User stats

2. **Jobs Board** (`/jobs`)
   - Job listings with search/filter
   - Job detail pages
   - Application tracking

### Medium Priority (Week 3-4)
3. **User Profile** (`/profile`)
   - Profile editing
   - Skills management
   - Privacy settings

4. **Events System** (`/events`)
   - Event listings
   - Event creation
   - RSVP functionality

### Lower Priority (Week 5+)
5. **Services Directory** (`/services`)
6. **Advanced Features** (notifications, messaging, etc.)

## 🤝 Code Review Guidelines

### Before Submitting PR
- [ ] Code follows TypeScript best practices
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] UI follows design system
- [ ] Database queries use RLS
- [ ] No console.log statements in production code

### PR Description Template
```markdown
## Feature: [Feature Name]

### Changes Made
- [ ] Added new component: ComponentName
- [ ] Implemented database operations
- [ ] Added error handling
- [ ] Responsive design implemented

### Testing Done
- [ ] Manual testing on desktop/mobile
- [ ] Authentication flows tested
- [ ] Database operations verified

### Screenshots
[Add screenshots of new features]
```

## 📞 Getting Help

1. **Check existing code patterns** in completed features
2. **Review Supabase documentation** for database operations
3. **Test authentication flows** before implementing new features
4. **Use TypeScript** for better development experience
5. **Follow the design system** for consistent UI

Remember: The foundation is solid - focus on building features that provide value to the Kenyan diaspora community!
