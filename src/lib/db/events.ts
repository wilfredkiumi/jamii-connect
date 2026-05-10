import { query, queryOne } from './index';

export interface Event {
  id: string;
  created_by: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  country: string | null;
  is_virtual: boolean;
  event_type: 'conference' | 'workshop' | 'networking' | 'cultural' | 'business' | 'social';
  price: number | null;
  currency: string;
  max_attendees: number | null;
  current_attendees: number;
  is_free: boolean;
  registration_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export async function getEvent(id: string): Promise<Event | null> {
  return queryOne<Event>('SELECT * FROM events WHERE id = $1', [id]);
}

export async function listEvents(options?: {
  limit?: number;
  offset?: number;
  event_type?: string;
  country?: string;
  is_free?: boolean;
  upcoming_only?: boolean;
}): Promise<Event[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (options?.event_type) {
    conditions.push(`event_type = $${i++}`);
    params.push(options.event_type);
  }
  if (options?.country) {
    conditions.push(`country = $${i++}`);
    params.push(options.country);
  }
  if (options?.is_free !== undefined) {
    conditions.push(`is_free = $${i++}`);
    params.push(options.is_free);
  }
  if (options?.upcoming_only !== false) {
    conditions.push(`start_date >= $${i++}`);
    params.push(new Date().toISOString());
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  params.push(limit, offset);
  return query<Event>(
    `SELECT * FROM events ${where} ORDER BY start_date ASC LIMIT $${i++} OFFSET $${i}`,
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
