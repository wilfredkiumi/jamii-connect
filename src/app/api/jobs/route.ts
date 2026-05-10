import { NextRequest, NextResponse } from 'next/server';
import { listJobs, createJob } from '@/lib/db/jobs';
import { getAuthenticatedUser } from '@/lib/auth/verify-token';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const jobs = await listJobs({
    limit: Number(searchParams.get('limit')) || 20,
    offset: Number(searchParams.get('offset')) || 0,
    job_type: searchParams.get('job_type') || undefined,
    work_type: searchParams.get('work_type') || undefined,
    experience_level: searchParams.get('experience_level') || undefined,
    country: searchParams.get('country') || undefined,
    is_diaspora_friendly: searchParams.get('diaspora_friendly') === 'true' ? true : undefined,
    visa_sponsorship: searchParams.get('visa_sponsorship') === 'true' ? true : undefined,
  });

  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const job = await createJob({ ...data, posted_by: auth.profile.id });
  return NextResponse.json(job, { status: 201 });
}
