import { cookies } from 'next/headers';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { getProfileBySub, createProfile, type Profile } from '@/lib/db/profiles';

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

export interface AuthenticatedUser {
  cognitoSub: string;
  profile: Profile;
}

/**
 * Resolves the Cognito session from request cookies and maps it to the Postgres
 * profile row, creating that row on first sign-in.
 *
 * Returns null only when the caller is genuinely unauthenticated. Infrastructure
 * failures (database down, misconfigured pool) are rethrown so they surface as
 * 500s rather than being disguised as 401s.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  // `cookies` is passed as the function itself — the Amplify adapter awaits it.
  const nextServerContext = { cookies };

  let cognitoSub: string;
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext,
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    if (!currentUser?.userId) return null;
    cognitoSub = currentUser.userId;
  } catch {
    // No valid session cookie — an unauthenticated caller, not an error.
    return null;
  }

  const existing = await getProfileBySub(cognitoSub);
  if (existing) return { cognitoSub, profile: existing };

  const session = await runWithAmplifyServerContext({
    nextServerContext,
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });

  const claims = session.tokens?.idToken?.payload;
  const email = typeof claims?.email === 'string' ? claims.email : '';
  const name =
    typeof claims?.name === 'string'
      ? claims.name
      : [claims?.given_name, claims?.family_name].filter((v) => typeof v === 'string').join(' ').trim();

  if (!email) return null;

  const profile = await createProfile({
    cognito_sub: cognitoSub,
    email,
    full_name: name || undefined,
  });

  return { cognitoSub, profile };
}
