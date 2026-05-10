import { NextRequest, NextResponse } from 'next/server';
import { listPosts, createPost } from '@/lib/db/posts';
import { getAuthenticatedUser } from '@/lib/auth/verify-token';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const posts = await listPosts({
    limit: Number(searchParams.get('limit')) || 20,
    offset: Number(searchParams.get('offset')) || 0,
    user_id: searchParams.get('user_id') || undefined,
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const post = await createPost({ ...data, user_id: auth.profile.id });
  return NextResponse.json(post, { status: 201 });
}
