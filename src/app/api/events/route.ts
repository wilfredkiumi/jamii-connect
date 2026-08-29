import { NextRequest, NextResponse } from 'next/server';
import { listEvents, createEvent } from '@/lib/db/events';
import { getAuthenticatedUser } from '@/lib/auth/verify-token';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const events = await listEvents({
    limit: Number(searchParams.get('limit')) || 20,
    offset: Number(searchParams.get('offset')) || 0,
    q: searchParams.get('q') || undefined,
    event_type: searchParams.get('event_type') || undefined,
    country: searchParams.get('country') || undefined,
    is_free: searchParams.get('is_free') === 'true' ? true : undefined,
    upcoming_only: searchParams.get('past') !== 'true',
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const event = await createEvent({ ...data, created_by: auth.profile.id });
  return NextResponse.json(event, { status: 201 });
}
