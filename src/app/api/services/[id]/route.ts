import { NextResponse } from 'next/server';
import { getService } from '@/lib/db/services';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = await getService(id);
  if (!record) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}
