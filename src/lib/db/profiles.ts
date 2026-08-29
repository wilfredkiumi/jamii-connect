import { query, queryOne } from './index';
import type { Profile, ProfileWithStats } from '@/types/database';

export type { Profile, ProfileWithStats };

export async function getProfileBySub(cognitoSub: string): Promise<Profile | null> {
  return queryOne<Profile>(
    'SELECT * FROM profiles WHERE cognito_sub = $1',
    [cognitoSub]
  );
}

export async function getProfileById(id: string): Promise<Profile | null> {
  return queryOne<Profile>(
    'SELECT * FROM profiles WHERE id = $1',
    [id]
  );
}

export async function createProfile(data: {
  cognito_sub: string;
  email: string;
  full_name?: string;
  username?: string;
}): Promise<Profile> {
  const rows = await query<Profile>(
    `INSERT INTO profiles (cognito_sub, email, full_name, username)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.cognito_sub, data.email, data.full_name || null, data.username || null]
  );
  return rows[0];
}

/**
 * Columns a user is allowed to change on their own profile.
 *
 * Deliberately excluded:
 *   - `id`, `cognito_sub`, `created_at`, `updated_at` — system-owned
 *   - `email`     — must stay in sync with the Cognito identity
 *   - `is_verified` — a trust signal; only an admin flow may grant it
 *
 * DECISION POINT: `username` is currently editable. It is UNIQUE and will
 * appear in profile URLs, so free renaming breaks inbound links and enables
 * handle-squatting. Remove it here if you want it set once at signup only.
 */
const EDITABLE_PROFILE_COLUMNS = new Set<string>([
  'username',
  'full_name',
  'avatar_url',
  'bio',
  'location',
  'country',
  'heritage_countries',
  'profession',
  'company',
  'education',
  'skills',
  'languages',
  'interests',
  'looking_for',
  'whatsapp_number',
  'linkedin_url',
  'twitter_url',
  'website_url',
  'is_mentor',
  'is_seeking_mentorship',
  'is_public_profile',
]);

export async function updateProfile(
  cognitoSub: string,
  updates: Record<string, unknown>
): Promise<Profile | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    // Column names cannot be parameterized, so they must come from the
    // allowlist rather than from the request body.
    if (value === undefined || !EDITABLE_PROFILE_COLUMNS.has(key)) continue;
    fields.push(`"${key}" = $${i}`);
    values.push(value);
    i++;
  }

  if (fields.length === 0) return getProfileBySub(cognitoSub);

  values.push(cognitoSub);
  const rows = await query<Profile>(
    `UPDATE profiles SET ${fields.join(', ')}, updated_at = NOW()
     WHERE cognito_sub = $${i} RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function listProfiles(options?: {
  limit?: number;
  offset?: number;
  country?: string;
  is_mentor?: boolean;
  q?: string;
}): Promise<Profile[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (options?.country) {
    conditions.push(`country = $${i++}`);
    params.push(options.country);
  }
  if (options?.is_mentor !== undefined) {
    conditions.push(`is_mentor = $${i++}`);
    params.push(options.is_mentor);
  }

  if (options?.q) {
    conditions.push(
      `(full_name ILIKE $${i} OR username ILIKE $${i} OR profession ILIKE $${i} OR company ILIKE $${i})`
    );
    params.push(`%${options.q}%`);
    i++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  params.push(limit, offset);
  return query<Profile>(
    `SELECT * FROM profiles ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
    params
  );
}

/**
 * The signed-in user's profile with engagement counts. The counts are derived
 * rather than stored, so they cannot drift out of sync with the source tables.
 */
export async function getProfileWithStats(cognitoSub: string): Promise<ProfileWithStats | null> {
  return queryOne<ProfileWithStats>(
    `SELECT p.*,
      (SELECT COUNT(*) FROM connections c
        WHERE c.status = 'accepted' AND (c.requester_id = p.id OR c.addressee_id = p.id)
      )::int AS connection_count,
      (SELECT COUNT(*) FROM posts po WHERE po.user_id = p.id)::int AS posts_count,
      (SELECT COUNT(*) FROM event_attendees a
        WHERE a.user_id = p.id AND a.status = 'attending'
      )::int AS events_attended
     FROM profiles p
     WHERE p.cognito_sub = $1`,
    [cognitoSub]
  );
}
