-- Phase 3: Data Collection Pipeline

CREATE TABLE IF NOT EXISTS imports (
  id SERIAL PRIMARY KEY,
  filename TEXT,
  import_type TEXT NOT NULL CHECK (import_type IN ('places_hierarchy', 'place_data')),
  format TEXT NOT NULL CHECK (format IN ('csv', 'json')),
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  rows_total INTEGER DEFAULT 0,
  rows_success INTEGER DEFAULT 0,
  rows_failed INTEGER DEFAULT 0,
  errors JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Tracks the in-process scheduler that periodically checks for updates.
-- Phase 3 ships this as a stub (no live external data source yet) — real
-- government/public dataset polling gets wired in as those sources are
-- identified.
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id SERIAL PRIMARY KEY,
  job_name TEXT UNIQUE NOT NULL,
  last_run_at TIMESTAMP,
  last_status TEXT,
  run_count INTEGER DEFAULT 0
);

INSERT INTO scheduled_jobs (job_name, last_status)
VALUES ('data_freshness_check', 'pending')
ON CONFLICT (job_name) DO NOTHING;
