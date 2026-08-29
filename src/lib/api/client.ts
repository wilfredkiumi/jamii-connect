/**
 * Browser-side access to the Postgres-backed API routes.
 *
 * Every function returns `{ data, error }` rather than throwing, matching the
 * shape the page components already destructure. `error` is non-null only for
 * genuine failures — an empty result is `data: []`, never a silent fallback.
 */

export interface ApiResult<T> {
  data: T | null;
  error: Error | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message =
        (body && typeof body.error === 'string' && body.error) ||
        `Request failed with status ${response.status}`;
      return { data: null, error: new Error(message) };
    }

    return { data: (await response.json()) as T, error: null };
  } catch (cause) {
    return {
      data: null,
      error: cause instanceof Error ? cause : new Error('Network request failed'),
    };
  }
}

function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

type ListParams = Record<string, string | number | boolean | undefined>;

// Jobs
export const listJobs = <T>(params: ListParams = {}) =>
  request<T[]>(`/api/jobs${toQueryString(params)}`);
export const searchJobs = <T>(q: string) => request<T[]>(`/api/jobs${toQueryString({ q })}`);
export const getJob = <T>(id: string) => request<T>(`/api/jobs/${id}`);
export const createJob = <T>(job: unknown) =>
  request<T>('/api/jobs', { method: 'POST', body: JSON.stringify(job) });

// Events
export const listEvents = <T>(params: ListParams = {}) =>
  request<T[]>(`/api/events${toQueryString(params)}`);
export const searchEvents = <T>(q: string) => request<T[]>(`/api/events${toQueryString({ q })}`);
export const getEvent = <T>(id: string) => request<T>(`/api/events/${id}`);
export const createEvent = <T>(event: unknown) =>
  request<T>('/api/events', { method: 'POST', body: JSON.stringify(event) });

// Services
export const listServices = <T>(params: ListParams = {}) =>
  request<T[]>(`/api/services${toQueryString(params)}`);
export const searchServices = <T>(q: string) =>
  request<T[]>(`/api/services${toQueryString({ q })}`);
export const getService = <T>(id: string) => request<T>(`/api/services/${id}`);

// Posts
export const listPosts = <T>(params: ListParams = {}) =>
  request<T[]>(`/api/posts${toQueryString(params)}`);
export const createPost = <T>(post: unknown) =>
  request<T>('/api/posts', { method: 'POST', body: JSON.stringify(post) });

// People
export const searchUsers = <T>(params: ListParams | string = {}) =>
  request<T[]>(`/api/profiles${toQueryString(typeof params === 'string' ? { q: params } : params)}`);

// Connections
export const listConnections = <T>() => request<T[]>('/api/connections');
export const createConnection = <T>(addressee_id: string, message?: string) =>
  request<T>('/api/connections', {
    method: 'POST',
    body: JSON.stringify({ addressee_id, message }),
  });
export const respondToConnection = <T>(id: string, status: 'accepted' | 'declined') =>
  request<T>('/api/connections', { method: 'PATCH', body: JSON.stringify({ id, status }) });

// Own profile
export const getUserProfile = <T>() => request<T>('/api/profile');
export const updateUserProfile = <T>(updates: unknown) =>
  request<T>('/api/profile', { method: 'PATCH', body: JSON.stringify(updates) });
