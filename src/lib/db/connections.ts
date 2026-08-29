import { query } from './index';
import type { Connection, ConnectionWithProfile } from '@/types/database';

export type { Connection, ConnectionWithProfile };

export async function listConnections(userId: string, options?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<ConnectionWithProfile[]> {
  const params: unknown[] = [userId];
  // $2/$3 are limit/offset; an optional status filter takes $4.
  const statusFilter = options?.status ? 'AND c.status = $4' : '';

  params.push(options?.limit ?? 20, options?.offset ?? 0);
  if (options?.status) params.push(options.status);

  return query<ConnectionWithProfile>(
    `SELECT c.*,
      json_build_object(
        'id', other.id,
        'full_name', other.full_name,
        'avatar_url', other.avatar_url,
        'location', other.location,
        'country', other.country,
        'profession', other.profession,
        'company', other.company,
        'bio', other.bio,
        'heritage_countries', other.heritage_countries,
        'is_verified', other.is_verified
      ) AS profile
     FROM connections c
     -- Join whichever side of the connection is not the viewer.
     JOIN profiles other
       ON other.id = CASE WHEN c.requester_id = $1 THEN c.addressee_id ELSE c.requester_id END
     WHERE (c.requester_id = $1 OR c.addressee_id = $1) ${statusFilter}
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    params
  );
}

export async function createConnection(data: {
  requester_id: string;
  addressee_id: string;
  message?: string;
}): Promise<Connection> {
  if (data.requester_id === data.addressee_id) {
    throw new Error('Cannot send a connection request to yourself');
  }
  const rows = await query<Connection>(
    `INSERT INTO connections (requester_id, addressee_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.requester_id, data.addressee_id, data.message || null]
  );
  return rows[0];
}

/**
 * Only the addressee of a still-pending request may accept or decline it.
 * The ownership check lives in the WHERE clause so it cannot be bypassed by a
 * caller that forgets to check first; a null return means "not yours, already
 * answered, or nonexistent" — all of which the caller should treat as a 404.
 */
export async function respondToConnection(
  id: string,
  addresseeId: string,
  status: 'accepted' | 'declined'
): Promise<Connection | null> {
  const rows = await query<Connection>(
    `UPDATE connections SET status = $1, updated_at = NOW()
     WHERE id = $2 AND addressee_id = $3 AND status = 'pending'
     RETURNING *`,
    [status, id, addresseeId]
  );
  return rows[0] || null;
}
