export interface Forum {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  lastActivity: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  forums: Forum[];
}

export const forumCategories: ForumCategory[] = [
  {
    id: 'general',
    name: 'General Discussions',
    slug: 'general',
    description: 'Discussions about general topics relevant to the Kenyan diaspora.',
    forums: [
      {
        id: 'introductions',
        name: 'Introductions',
        slug: 'introductions',
        description: 'New here? Introduce yourself to the community!',
        postCount: 120,
        lastActivity: '2 hours ago',
      },
      {
        id: 'daily-chat',
        name: 'Daily Chat',
        slug: 'daily-chat',
        description: 'Casual conversations and daily happenings.',
        postCount: 543,
        lastActivity: '15 minutes ago',
      },
    ],
  },
  {
    id: 'life-in-uk',
    name: 'Life in the UK',
    slug: 'life-in-uk',
    description: 'Topics related to living, working, and studying in the UK.',
    forums: [
      {
        id: 'housing',
        name: 'Housing & Accommodation',
        slug: 'housing',
        description: 'Tips and advice on finding a home, renting, and buying.',
        postCount: 89,
        lastActivity: '1 day ago',
      },
      {
        id: 'jobs-careers',
        name: 'Jobs & Careers',
        slug: 'jobs-careers',
        description: 'Discuss job opportunities, career advice, and professional development.',
        postCount: 210,
        lastActivity: '3 hours ago',
      },
      {
        id: 'education',
        name: 'Education & Study',
        slug: 'education',
        description: 'Information for students and those pursuing further education.',
        postCount: 75,
        lastActivity: '5 days ago',
      },
    ],
  },
  {
    id: 'culture-community',
    name: 'Culture & Community',
    slug: 'culture-community',
    description: 'Celebrating Kenyan culture and community events.',
    forums: [
      {
        id: 'events-meetups',
        name: 'Events & Meetups',
        slug: 'events-meetups',
        description: 'Organize and discuss community gatherings and events.',
        postCount: 150,
        lastActivity: 'Yesterday',
      },
      {
        id: 'food-recipes',
        name: 'Food & Recipes',
        slug: 'food-recipes',
        description: 'Share your favorite Kenyan recipes and discuss local eateries.',
        postCount: 95,
        lastActivity: '4 hours ago',
      },
    ],
  },
];
