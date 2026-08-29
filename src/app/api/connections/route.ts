import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listConnections, createConnection, respondToConnection } from '@/lib/db/connections';
import { getAuthenticatedUser } from '@/lib/auth/verify-token';

const createSchema = z.object({
  addressee_id: z.string().uuid(),
  message: z.string().max(500).optional(),
});

const respondSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['accepted', 'declined']),
});

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(await listConnections(auth.profile.id));
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (parsed.data.addressee_id === auth.profile.id) {
    return NextResponse.json({ error: 'Cannot connect to yourself' }, { status: 400 });
  }

  const connection = await createConnection({
    requester_id: auth.profile.id,
    addressee_id: parsed.data.addressee_id,
    message: parsed.data.message,
  });
  return NextResponse.json(connection, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = respondSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Ownership is enforced in the UPDATE's WHERE clause; a null result means the
  // request is not this user's to answer, or is no longer pending.
  const connection = await respondToConnection(
    parsed.data.id,
    auth.profile.id,
    parsed.data.status
  );
  if (!connection) {
    return NextResponse.json({ error: 'Connection request not found' }, { status: 404 });
  }
  return NextResponse.json(connection);
}
