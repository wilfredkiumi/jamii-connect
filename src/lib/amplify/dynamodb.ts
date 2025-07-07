import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

let docClient: DynamoDBDocumentClient | null = null;

export function getDynamoDBClient() {
  if (!docClient) {
    const client = new DynamoDBClient({
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' },
        identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
      }),
    });

    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  return docClient;
}

// Table names
export const TABLES = {
  USERS: process.env.NEXT_PUBLIC_USERS_TABLE || 'JamiiConnect-Users',
  POSTS: process.env.NEXT_PUBLIC_POSTS_TABLE || 'JamiiConnect-Posts',
  JOBS: process.env.NEXT_PUBLIC_JOBS_TABLE || 'JamiiConnect-Jobs',
  EVENTS: process.env.NEXT_PUBLIC_EVENTS_TABLE || 'JamiiConnect-Events',
  SERVICES: process.env.NEXT_PUBLIC_SERVICES_TABLE || 'JamiiConnect-Services',
  CONNECTIONS: process.env.NEXT_PUBLIC_CONNECTIONS_TABLE || 'JamiiConnect-Connections',
} as const;

// GSI names
export const GSI = {
  BY_TIMESTAMP: 'ByTimestamp',
  BY_USER: 'ByUser',
  BY_CATEGORY: 'ByCategory',
  BY_STATUS: 'ByStatus',
  BY_LOCATION: 'ByLocation',
} as const;

// Helper functions for generating keys
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Base entity interface
export interface BaseEntity {
  PK: string;
  SK: string;
  entityType: string;
  createdAt: string;
  updatedAt: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
}

// User entity
export interface UserEntity extends BaseEntity {
  entityType: 'USER';
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  location?: string;
  bio?: string;
  heritageCountry?: string;
  currentCountry?: string;
  skills?: string[];
  interests?: string[];
  profileImage?: string;
  verified: boolean;
}

// Post entity
export interface PostEntity extends BaseEntity {
  entityType: 'POST';
  postId: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  category?: string;
  tags?: string[];
}

// Job entity
export interface JobEntity extends BaseEntity {
  entityType: 'JOB';
  jobId: string;
  userId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  benefits?: string[];
  diasporaFriendly: boolean;
  visaSponsorship: boolean;
  applicationDeadline?: string;
  status: 'active' | 'closed' | 'draft';
}

// Event entity
export interface EventEntity extends BaseEntity {
  entityType: 'EVENT';
  eventId: string;
  userId: string;
  organizerName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  locationType: 'in-person' | 'virtual' | 'hybrid';
  category: string;
  capacity?: number;
  attendeeCount: number;
  price?: number;
  currency?: string;
  image?: string;
  tags?: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// Service entity
export interface ServiceEntity extends BaseEntity {
  entityType: 'SERVICE';
  serviceId: string;
  userId: string;
  providerName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  serviceArea: string[];
  pricing?: {
    type: 'fixed' | 'hourly' | 'custom';
    amount?: number;
    currency?: string;
  };
  availability: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  verified: boolean;
}

// Connection entity
export interface ConnectionEntity extends BaseEntity {
  entityType: 'CONNECTION';
  connectionId: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  requesterName: string;
  connectedUserName: string;
  message?: string;
}