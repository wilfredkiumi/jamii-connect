export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isModerator?: boolean;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  views: number;
  replies: number;
  lastActivity: string;
  posts: Post[];
}

export interface ForumTopicsData {
  [categorySlug: string]: {
    [forumSlug: string]: Topic[];
  };
}

export const forumTopicsData: ForumTopicsData = {
  general: {
    introductions: [
      {
        id: 'intro-1',
        title: 'Hello from London!',
        slug: 'hello-from-london',
        author: { id: 'user1', name: 'Sarah K.', avatar: '/avatars/avatar-1.png' },
        views: 150,
        replies: 5,
        lastActivity: '1 hour ago',
        posts: [
          {
            id: 'post-1-1',
            author: { id: 'user1', name: 'Sarah K.', avatar: '/avatars/avatar-1.png' },
            content: 'Hi everyone! Just moved to London from Nairobi. Looking forward to connecting with fellow Kenyans here.',
            upvotes: 15,
            downvotes: 0,
            createdAt: '2 hours ago',
          },
          {
            id: 'post-1-2',
            author: { id: 'user2', name: 'James O.', avatar: '/avatars/avatar-2.png' },
            content: 'Welcome, Sarah! London is great. What part are you in?',
            upvotes: 5,
            downvotes: 0,
            createdAt: '1 hour ago',
          },
          {
            id: 'post-1-3',
            author: { id: 'user3', name: 'Admin M.', avatar: '/avatars/avatar-3.png', isModerator: true },
            content: 'Glad to have you, Sarah! Feel free to ask any questions.',
            upvotes: 10,
            downvotes: 0,
            createdAt: '30 minutes ago',
          },
        ],
      },
      {
        id: 'intro-2',
        title: 'New to Manchester',
        slug: 'new-to-manchester',
        author: { id: 'user4', name: 'David M.', avatar: '/avatars/avatar-4.png' },
        views: 80,
        replies: 2,
        lastActivity: '1 day ago',
        posts: [
          {
            id: 'post-2-1',
            author: { id: 'user4', name: 'David M.', avatar: '/avatars/avatar-4.png' },
            content: 'Hey all, recently relocated to Manchester. Any tips for a newcomer?',
            upvotes: 8,
            downvotes: 0,
            createdAt: '1 day ago',
          },
        ],
      },
    ],
    'daily-chat': [
      {
        id: 'chat-1',
        title: 'What\'s everyone up to this weekend?',
        slug: 'weekend-plans',
        author: { id: 'user5', name: 'Grace N.', avatar: '/avatars/avatar-5.png' },
        views: 200,
        replies: 10,
        lastActivity: '10 minutes ago',
        posts: [
          {
            id: 'post-3-1',
            author: { id: 'user5', name: 'Grace N.', avatar: '/avatars/avatar-5.png' },
            content: 'Thinking of checking out a new restaurant. Any recommendations in Birmingham?',
            upvotes: 12,
            downvotes: 0,
            createdAt: '1 hour ago',
          },
        ],
      },
    ],
  },
  'life-in-uk': {
    housing: [
      {
        id: 'housing-1',
        title: 'Best areas to live in Birmingham for families',
        slug: 'best-areas-birmingham',
        author: { id: 'user6', name: 'Peter K.', avatar: '/avatars/avatar-6.png' },
        views: 300,
        replies: 8,
        lastActivity: '2 days ago',
        posts: [
          {
            id: 'post-4-1',
            author: { id: 'user6', name: 'Peter K.', avatar: '/avatars/avatar-6.png' },
            content: 'Looking for family-friendly neighborhoods in Birmingham. Any suggestions?',
            upvotes: 20,
            downvotes: 1,
            createdAt: '3 days ago',
          },
        ],
      },
    ],
    'jobs-careers': [
      {
        id: 'jobs-1',
        title: 'Advice for IT professionals seeking jobs in London',
        slug: 'it-jobs-london',
        author: { id: 'user7', name: 'Esther W.', avatar: '/avatars/avatar-7.png' },
        views: 450,
        replies: 15,
        lastActivity: '5 hours ago',
        posts: [
          {
            id: 'post-5-1',
            author: { id: 'user7', name: 'Esther W.', avatar: '/avatars/avatar-7.png' },
            content: 'Any IT professionals here with tips on navigating the London job market?',
            upvotes: 25,
            downvotes: 0,
            createdAt: '1 day ago',
          },
        ],
      },
    ],
  },
  'culture-community': {
    'events-meetups': [
      {
        id: 'event-1',
        title: 'Upcoming Kenyan BBQ in Hyde Park',
        slug: 'kenyan-bbq-hyde-park',
        author: { id: 'user8', name: 'Community Org', avatar: '/avatars/avatar-8.png' },
        views: 180,
        replies: 7,
        lastActivity: 'Yesterday',
        posts: [
          {
            id: 'post-6-1',
            author: { id: 'user8', name: 'Community Org', avatar: '/avatars/avatar-8.png' },
            content: 'Join us for a fun Kenyan BBQ this Saturday at Hyde Park! All welcome.',
            upvotes: 30,
            downvotes: 0,
            createdAt: '2 days ago',
          },
        ],
      },
    ],
  },
};