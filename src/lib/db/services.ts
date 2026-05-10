import { query, queryOne } from './index';

export interface Service {
  id: string;
  provider_id: string;
  service_name: string;
  category: string;
  description: string;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  location: string | null;
  service_area: string[];
  pricing_type: string;
  pricing_amount: number | null;
  pricing_currency: string;
  is_verified: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export async function getService(id: string): Promise<Service | null> {
  return queryOne<Service>('SELECT * FROM services WHERE id = $1', [id]);
}

export async function listServices(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  location?: string;
  is_verified?: boolean;
}): Promise<Service[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (options?.category) {
    conditions.push(`category = $${i++}`);
    params.push(options.category);
  }
  if (options?.location) {
    conditions.push(`location ILIKE $${i++}`);
    params.push(`%${options.location}%`);
  }
  if (options?.is_verified !== undefined) {
    conditions.push(`is_verified = $${i++}`);
    params.push(options.is_verified);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  params.push(limit, offset);
  return query<Service>(
    `SELECT * FROM services ${where} ORDER BY is_verified DESC, created_at DESC LIMIT $${i++} OFFSET $${i}`,
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
