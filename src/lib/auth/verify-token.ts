import { headers } from 'next/headers';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { getProfileBySub, createProfile } from '@/lib/db/profiles';

const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
        identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
      },
    },
  },
});

export async function getAuthenticatedUser() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { headers: await headers() },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!currentUser) return null;

    // Look up or create profile in Postgres
    let profile = await getProfileBySub(currentUser.userId);

    if (!profile) {
      const session = await runWithAmplifyServerContext({
        nextServerContext: { headers: await headers() },
        operation: (contextSpec) => fetchAuthSession(contextSpec),
      });

      const email = (session.tokens?.idToken?.payload?.email as string) || '';
      const name = (session.tokens?.idToken?.payload?.name as string) || '';

      profile = await createProfile({
        cognito_sub: currentUser.userId,
        email,
        full_name: name,
      });
    }

    return { cognitoUser: currentUser, profile };
  } catch {
    return null;
  }
}
