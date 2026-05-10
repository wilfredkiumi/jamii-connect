import { query } from './index';

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionWithProfile extends Connection {
  connected_user_name: string | null;
  connected_user_avatar: string | null;
  connected_user_profession: string | null;
}

export async function listConnections(userId: string, options?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<ConnectionWithProfile[]> {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;
  const statusFilter = options?.status ? `AND c.status = $4` : '';

  const params: unknown[] = [userId, userId, limit, offset];
  if (options?.status) params.push(options.status);

  return query<ConnectionWithProfile>(
    `SELECT c.*,
      CASE
        WHEN c.requester_id = $1 THEN pr.full_name
        ELSE req.full_name
      END as connected_user_name,
      CASE
        WHEN c.requester_id = $1 THEN pr.avatar_url
        ELSE req.avatar_url
      END as connected_user_avatar,
      CASE
        WHEN c.requester_id = $1 THEN pr.profession
        ELSE req.profession
      END as connected_user_profession
     FROM connections c
     JOIN profiles pr ON c.addressee_id = pr.id
     JOIN profiles req ON c.requester_id = req.id
     WHERE (c.requester_id = $1 OR c.addressee_id = $2) ${statusFilter}
     ORDER BY c.created_at DESC
     LIMIT $3 OFFSET $4`,
    params
  );
}

export async function createConnection(data: {
  requester_id: string;
  addressee_id: string;
  message?: string;
}): Promise<Connection> {
  const rows = await query<Connection>(
    `INSERT INTO connections (requester_id, addressee_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.requester_id, data.addressee_id, data.message || null]
  );
  return rows[0];
}

export async function updateConnectionStatus(
  id: string,
  status: 'accepted' | 'declined'
): Promise<Connection | null> {
  const rows = await query<Connection>(
    'UPDATE connections SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0] || null;
}
