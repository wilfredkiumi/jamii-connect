import { query, queryOne } from './index';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author_name: string | null;
  author_avatar: string | null;
}

export async function getPost(id: string): Promise<PostWithAuthor | null> {
  return queryOne<PostWithAuthor>(
    `SELECT p.*, pr.full_name as author_name, pr.avatar_url as author_avatar
     FROM posts p
     JOIN profiles pr ON p.user_id = pr.id
     WHERE p.id = $1`,
    [id]
  );
}

export async function listPosts(options?: {
  limit?: number;
  offset?: number;
  user_id?: string;
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

  params.push(limit, offset);
  return query<PostWithAuthor>(
    `SELECT p.*, pr.full_name as author_name, pr.avatar_url as author_avatar
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
