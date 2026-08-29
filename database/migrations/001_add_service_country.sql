-- Services are filtered by country in the UI, and both `jobs` and `events`
-- already carry one. Backfilled as NULL; existing rows keep their free-text
-- `location` until a country is set.
ALTER TABLE services ADD COLUMN IF NOT EXISTS country TEXT;
CREATE INDEX IF NOT EXISTS idx_services_country ON services(country);
