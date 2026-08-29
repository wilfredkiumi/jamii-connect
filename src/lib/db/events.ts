import { query, queryOne } from './index';
import type { Event, EventWithOrganizer } from '@/types/database';

export type { Event, EventWithOrganizer };

export async function getEvent(id: string): Promise<EventWithOrganizer | null> {
  return queryOne<EventWithOrganizer>(
    `SELECT e.*,
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
      ) AS organizer,
      FALSE AS is_attending
     FROM events e
     JOIN profiles pr ON e.created_by = pr.id
     WHERE e.id = $1`,
    [id]
  );
}

export async function listEvents(options?: {
  limit?: number;
  offset?: number;
  event_type?: string;
  country?: string;
  is_free?: boolean;
  upcoming_only?: boolean;
  q?: string;
  /** Signed-in profile id, used to compute `is_attending`. */
  viewer_id?: string;
}): Promise<EventWithOrganizer[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (options?.event_type) {
    conditions.push(`e.event_type = $${i++}`);
    params.push(options.event_type);
  }
  if (options?.country) {
    conditions.push(`e.country = $${i++}`);
    params.push(options.country);
  }
  if (options?.is_free !== undefined) {
    conditions.push(`e.is_free = $${i++}`);
    params.push(options.is_free);
  }
  if (options?.upcoming_only !== false) {
    conditions.push(`e.start_date >= $${i++}`);
    params.push(new Date().toISOString());
  }

  if (options?.q) {
    // One placeholder reused across columns. The value is parameterized, so
    // this is injection-safe; note that `%` or `_` typed by the user still act
    // as wildcards, which for a search box is acceptable behaviour.
    conditions.push(`(e.title ILIKE $${i} OR e.description ILIKE $${i} OR e.location ILIKE $${i})`);
    params.push(`%${options.q}%`);
    i++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  const viewerParam = i + 2; // sits after the limit/offset placeholders
  params.push(limit, offset, options?.viewer_id ?? null);
  return query<EventWithOrganizer>(
    `SELECT e.*,
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
      ) AS organizer,
      COALESCE($${viewerParam}::uuid IS NOT NULL AND EXISTS (
        SELECT 1 FROM event_attendees a
        WHERE a.event_id = e.id AND a.user_id = $${viewerParam} AND a.status = 'attending'
      ), FALSE) AS is_attending
     FROM events e
     JOIN profiles pr ON e.created_by = pr.id
     ${where}
     ORDER BY e.start_date ASC
     LIMIT $${i++} OFFSET $${i}`,
    params
  );
}

export async function createEvent(data: Omit<Event, 'id' | 'current_attendees' | 'created_at' | 'updated_at'>): Promise<Event> {
  const rows = await query<Event>(
    `INSERT INTO events (
      created_by, title, description, image_url, start_date, end_date,
      location, country, is_virtual, event_type, price, currency,
      max_attendees, is_free, registration_url, tags
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING *`,
    [
      data.created_by, data.title, data.description, data.image_url,
      data.start_date, data.end_date, data.location, data.country,
      data.is_virtual, data.event_type, data.price, data.currency,
      data.max_attendees, data.is_free, data.registration_url, data.tags,
    ]
  );
  return rows[0];
}
