import { cookies } from 'next/headers';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs';
import { configureAmplify } from './config';
import type { UserProfile } from './auth';

// Configure Amplify for server-side usage
configureAmplify();

export async function getServerUser() {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        return await getCurrentUser(contextSpec);
      },
    });
    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

export async function getServerSession() {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        return await fetchAuthSession(contextSpec);
      },
    });
    return session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

export async function getServerUserProfile(): Promise<UserProfile | null> {
  try {
    const profile = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const user = await getCurrentUser(contextSpec);
        // In a real implementation, you would fetch the full profile from DynamoDB
        // For now, we'll return a basic profile based on the Cognito user
        return {
          id: user.userId,
          email: user.signInDetails?.loginId || '',
          username: user.username,
        } as UserProfile;
      },
    });
    return profile;
  } catch (error) {
    console.error('Error getting server user profile:', error);
    return null;
  }
}