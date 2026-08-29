import { NextRequest, NextResponse } from 'next/server';
import { listProfiles } from '@/lib/db/profiles';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const profiles = await listProfiles({
    limit: Number(searchParams.get('limit')) || 20,
    offset: Number(searchParams.get('offset')) || 0,
    country: searchParams.get('country') || undefined,
    is_mentor: searchParams.get('mentor') === 'true' ? true : undefined,
    q: searchParams.get('q') || undefined,
  });

  return NextResponse.json(profiles);
}
