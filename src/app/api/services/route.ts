import { NextRequest, NextResponse } from 'next/server';
import { listServices, createService } from '@/lib/db/services';
import { getAuthenticatedUser } from '@/lib/auth/verify-token';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const services = await listServices({
    limit: Number(searchParams.get('limit')) || 20,
    offset: Number(searchParams.get('offset')) || 0,
    category: searchParams.get('category') || undefined,
    location: searchParams.get('location') || undefined,
    is_verified: searchParams.get('verified') === 'true' ? true : undefined,
  });

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const service = await createService({ ...data, provider_id: auth.profile.id });
  return NextResponse.json(service, { status: 201 });
}
