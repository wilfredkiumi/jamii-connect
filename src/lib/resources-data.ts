export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  type: 'document' | 'template' | 'link';
  adminOnly: boolean;
}

export const resources: Resource[] = [
  {
    id: 'uk-visa-guide',
    title: 'UK Visa Application Guide',
    description: 'A comprehensive guide to various UK visa categories and application processes.',
    category: 'Immigration',
    link: '/documents/uk-visa-guide.pdf',
    type: 'document',
    adminOnly: false,
  },
  {
    id: 'nhs-registration-template',
    title: 'NHS Registration Template',
    description: 'A template and checklist for registering with the NHS and finding a GP.',
    category: 'Healthcare',
    link: '/documents/nhs-registration-template.docx',
    type: 'template',
    adminOnly: false,
  },
  {
    id: 'job-search-strategy',
    title: 'Effective Job Search Strategies in the UK',
    description: 'Tips and strategies for Kenyans seeking employment in the UK market.',
    category: 'Employment',
    link: 'https://www.example.com/job-search-strategy',
    type: 'link',
    adminOnly: false,
  },
  {
    id: 'business-startup-guide',
    title: 'UK Business Startup Guide (Admin Only)',
    description: 'A detailed guide for setting up a business in the UK, including legal and financial considerations.',
    category: 'Business',
    link: '/documents/uk-business-startup-guide.pdf',
    type: 'document',
    adminOnly: true,
  },
  {
    id: 'community-event-planning-template',
    title: 'Community Event Planning Template (Admin Only)',
    description: 'A template to help organize and manage community events efficiently.',
    category: 'Community Management',
    link: '/documents/event-planning-template.xlsx',
    type: 'template',
    adminOnly: true,
  },
];
