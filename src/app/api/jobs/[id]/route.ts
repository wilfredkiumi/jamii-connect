import { NextResponse } from 'next/server';
import { getJob } from '@/lib/db/jobs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = await getJob(id);
  if (!record) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}
