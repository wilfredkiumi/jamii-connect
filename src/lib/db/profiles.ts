import { query, queryOne } from './index';

export interface Profile {
  id: string;
  cognito_sub: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  country: string | null;
  heritage_countries: string[];
  profession: string | null;
  company: string | null;
  education: string | null;
  skills: string[];
  languages: string[];
  interests: string[];
  looking_for: string[];
  whatsapp_number: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  is_mentor: boolean;
  is_seeking_mentorship: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

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

export async function updateProfile(
  cognitoSub: string,
  updates: Partial<Omit<Profile, 'id' | 'cognito_sub' | 'created_at' | 'updated_at'>>
): Promise<Profile | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }

  if (fields.length === 0) return getProfileBySub(cognitoSub);

  values.push(cognitoSub);
  const rows = await query<Profile>(
    `UPDATE profiles SET ${fields.join(', ')} WHERE cognito_sub = $${i} RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function listProfiles(options?: {
  limit?: number;
  offset?: number;
  country?: string;
  is_mentor?: boolean;
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

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  params.push(limit, offset);
  return query<Profile>(
    `SELECT * FROM profiles ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
    params
  );
}
