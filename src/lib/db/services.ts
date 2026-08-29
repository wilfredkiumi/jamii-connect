import { query, queryOne } from './index';
import type { Service, ServiceWithProvider } from '@/types/database';

export type { Service, ServiceWithProvider };

export async function getService(id: string): Promise<Service | null> {
  return queryOne<Service>('SELECT * FROM services WHERE id = $1', [id]);
}

export async function listServices(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  location?: string;
  is_verified?: boolean;
  country?: string;
  q?: string;
}): Promise<ServiceWithProvider[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (options?.category) {
    conditions.push(`s.category = $${i++}`);
    params.push(options.category);
  }
  if (options?.location) {
    conditions.push(`location ILIKE $${i++}`);
    params.push(`%${options.location}%`);
  }
  if (options?.is_verified !== undefined) {
    conditions.push(`s.is_verified = $${i++}`);
    params.push(options.is_verified);
  }

  if (options?.q) {
    // One placeholder reused across columns. The value is parameterized, so
    // this is injection-safe; note that `%` or `_` typed by the user still act
    // as wildcards, which for a search box is acceptable behaviour.
    conditions.push(`(s.service_name ILIKE $${i} OR s.description ILIKE $${i} OR s.category ILIKE $${i})`);
    params.push(`%${options.q}%`);
    i++;
  }

  if (options?.country) {
    conditions.push(`s.country = $${i++}`);
    params.push(options.country);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  params.push(limit, offset);
  return query<ServiceWithProvider>(
    `SELECT s.*,
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
      ) AS provider
     FROM services s
     JOIN profiles pr ON s.provider_id = pr.id
     ${where}
     ORDER BY s.is_verified DESC, s.created_at DESC
     LIMIT $${i++} OFFSET $${i}`,
    params
  );
}

export async function createService(data: Omit<Service, 'id' | 'is_verified' | 'rating' | 'review_count' | 'created_at' | 'updated_at'>): Promise<Service> {
  const rows = await query<Service>(
    `INSERT INTO services (
      provider_id, service_name, category, description,
      contact_phone, contact_email, website, location,
      service_area, pricing_type, pricing_amount, pricing_currency
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      data.provider_id, data.service_name, data.category, data.description,
      data.contact_phone, data.contact_email, data.website, data.location,
      data.service_area, data.pricing_type, data.pricing_amount, data.pricing_currency,
    ]
  );
  return rows[0];
}
