import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/verify-token';
import { updateProfile } from '@/lib/db/profiles';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(auth.profile);
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await request.json();
  const profile = await updateProfile(auth.profile.cognito_sub, updates);
  return NextResponse.json(profile);
}
