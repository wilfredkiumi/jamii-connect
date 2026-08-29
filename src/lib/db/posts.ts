import { query, queryOne } from './index';
import type { Post, PostWithAuthor } from '@/types/database';

export type { Post, PostWithAuthor };

export async function getPost(id: string, viewerId?: string): Promise<PostWithAuthor | null> {
  return queryOne<PostWithAuthor>(
    `SELECT p.*,
      json_build_object(
        'id', pr.id,
        'full_name', pr.full_name,
        'avatar_url', pr.avatar_url,
        'location', pr.location,
        'country', pr.country,
        'profession', pr.profession,
        'company', pr.company,
        'bio', pr.bio,
        'heritage_countries', pr.heritage_countries,
        'is_verified', pr.is_verified
      ) AS author,
      COALESCE($2::uuid IS NOT NULL AND EXISTS (
        SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = $2
      ), FALSE) AS is_liked
     FROM posts p
     JOIN profiles pr ON p.user_id = pr.id
     WHERE p.id = $1`,
    [id, viewerId ?? null]
  );
}

export async function listPosts(options?: {
  limit?: number;
  offset?: number;
  user_id?: string;
  /** Signed-in profile id, used to compute `is_liked`. Omit for anonymous readers. */
  viewer_id?: string;
}): Promise<PostWithAuthor[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (options?.user_id) {
    conditions.push(`p.user_id = $${i++}`);
    params.push(options.user_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  const viewerParam = i + 2; // sits after the limit/offset placeholders
  params.push(limit, offset, options?.viewer_id ?? null);
  return query<PostWithAuthor>(
    `SELECT p.*,
      json_build_object(
        'id', pr.id,
        'full_name', pr.full_name,
        'avatar_url', pr.avatar_url,
        'location', pr.location,
        'country', pr.country,
        'profession', pr.profession,
        'company', pr.company,
        'bio', pr.bio,
        'heritage_countries', pr.heritage_countries,
        'is_verified', pr.is_verified
      ) AS author,
      COALESCE($${viewerParam}::uuid IS NOT NULL AND EXISTS (
        SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = $${viewerParam}
      ), FALSE) AS is_liked
     FROM posts p
     JOIN profiles pr ON p.user_id = pr.id
     ${where}
     ORDER BY p.is_pinned DESC, p.created_at DESC
     LIMIT $${i++} OFFSET $${i}`,
    params
  );
}

export async function createPost(data: {
  user_id: string;
  content: string;
  image_url?: string;
  tags?: string[];
}): Promise<Post> {
  const rows = await query<Post>(
    `INSERT INTO posts (user_id, content, image_url, tags)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.user_id, data.content, data.image_url || null, data.tags || []]
  );
  return rows[0];
}

export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    await query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId]
    );
    await query(
      'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1) WHERE id = $1',
      [postId]
    );
    return true;
  } catch {
    return false;
  }
}

export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  await query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
  await query(
    'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1) WHERE id = $1',
    [postId]
  );
  return true;
}
