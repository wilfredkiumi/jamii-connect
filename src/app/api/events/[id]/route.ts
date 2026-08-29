import { NextResponse } from 'next/server';
import { getEvent } from '@/lib/db/events';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = await getEvent(id);
  if (!record) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}
