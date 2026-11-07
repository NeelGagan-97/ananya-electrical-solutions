CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  advertiser TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('affiliate', 'direct')),
  status TEXT NOT NULL DEFAULT 'paused' CHECK (status IN ('active', 'paused')),
  starts_at TEXT,
  ends_at TEXT,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ads_status_schedule
  ON ads (status, starts_at, ends_at);
