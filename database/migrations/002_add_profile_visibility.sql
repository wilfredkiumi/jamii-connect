-- Backs the "Public Profile" switch on /profile, which previously toggled a
-- field that was never persisted. Defaults to TRUE to preserve existing
-- behaviour (all profiles were effectively public).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN DEFAULT TRUE;
