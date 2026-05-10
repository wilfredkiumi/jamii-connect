import { NextRequest, NextResponse } from 'next/server';
import { listConnections, createConnection, updateConnectionStatus } from '@/lib/db/connections';
import { getAuthenticatedUser } from '@/lib/auth/verify-token';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const connections = await listConnections(auth.profile.id);
  return NextResponse.json(connections);
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { addressee_id, message } = await request.json();
  const connection = await createConnection({
    requester_id: auth.profile.id,
    addressee_id,
    message,
  });
  return NextResponse.json(connection, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await request.json();
  const connection = await updateConnectionStatus(id, status);
  return NextResponse.json(connection);
}
