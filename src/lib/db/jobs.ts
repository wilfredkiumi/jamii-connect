import { query, queryOne } from './index';

export interface Job {
  id: string;
  posted_by: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  country: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  work_type: 'remote' | 'hybrid' | 'on-site';
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  company_size: string | null;
  industry: string | null;
  application_url: string | null;
  application_email: string | null;
  is_diaspora_friendly: boolean;
  visa_sponsorship: boolean;
  is_active: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  expires_at: string | null;
}

export async function getJob(id: string): Promise<Job | null> {
  return queryOne<Job>('SELECT * FROM jobs WHERE id = $1', [id]);
}

export async function listJobs(options?: {
  limit?: number;
  offset?: number;
  job_type?: string;
  work_type?: string;
  experience_level?: string;
  country?: string;
  is_diaspora_friendly?: boolean;
  visa_sponsorship?: boolean;
  is_active?: boolean;
}): Promise<Job[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (options?.job_type) {
    conditions.push(`job_type = $${i++}`);
    params.push(options.job_type);
  }
  if (options?.work_type) {
    conditions.push(`work_type = $${i++}`);
    params.push(options.work_type);
  }
  if (options?.experience_level) {
    conditions.push(`experience_level = $${i++}`);
    params.push(options.experience_level);
  }
  if (options?.country) {
    conditions.push(`country = $${i++}`);
    params.push(options.country);
  }
  if (options?.is_diaspora_friendly !== undefined) {
    conditions.push(`is_diaspora_friendly = $${i++}`);
    params.push(options.is_diaspora_friendly);
  }
  if (options?.visa_sponsorship !== undefined) {
    conditions.push(`visa_sponsorship = $${i++}`);
    params.push(options.visa_sponsorship);
  }
  if (options?.is_active !== undefined) {
    conditions.push(`is_active = $${i++}`);
    params.push(options.is_active);
  } else {
    conditions.push(`is_active = $${i++}`);
    params.push(true);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  params.push(limit, offset);
  return query<Job>(
    `SELECT * FROM jobs ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
    params
  );
}

export async function createJob(data: Omit<Job, 'id' | 'views_count' | 'applications_count' | 'created_at'>): Promise<Job> {
  const rows = await query<Job>(
    `INSERT INTO jobs (
      posted_by, title, company, company_logo, location, country,
      job_type, work_type, salary_min, salary_max, currency, description,
      requirements, benefits, skills, experience_level, company_size,
      industry, application_url, application_email, is_diaspora_friendly,
      visa_sponsorship, is_active, expires_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
    RETURNING *`,
    [
      data.posted_by, data.title, data.company, data.company_logo,
      data.location, data.country, data.job_type, data.work_type,
      data.salary_min, data.salary_max, data.currency, data.description,
      data.requirements, data.benefits, data.skills, data.experience_level,
      data.company_size, data.industry, data.application_url,
      data.application_email, data.is_diaspora_friendly,
      data.visa_sponsorship, data.is_active, data.expires_at,
    ]
  );
  return rows[0];
}

export async function incrementJobViews(id: string): Promise<void> {
  await query('UPDATE jobs SET views_count = views_count + 1 WHERE id = $1', [id]);
}
