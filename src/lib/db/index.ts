import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Add your Neon pooled connection string to .env.local ' +
      '(the host should contain "-pooler").'
  );
}

// Neon (and any managed Postgres) requires TLS; local dev does not.
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

// Serverless functions each get their own pool, so keep it small and let idle
// connections drop quickly — Neon's pooler multiplexes on its side.
const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: true },
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

export default pool;

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return (result.rows[0] as T) || null;
}
