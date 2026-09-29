-- Phase 2: Place Information
-- One row per (place_type, place_id) holding structured data for each analysis
-- category. JSONB keeps each category's shape flexible while Phase 3 (real data
-- pipelines) and Phase 4 (analytics) get built out — categories can gain fields
-- without a migration each time.

CREATE TABLE IF NOT EXISTS place_data (
  id SERIAL PRIMARY KEY,
  place_type TEXT NOT NULL CHECK (place_type IN ('state', 'district', 'city', 'village')),
  place_id INTEGER NOT NULL,

  population JSONB,
  economy JSONB,
  education JSONB,
  healthcare JSONB,
  infrastructure JSONB,
  environment JSONB,
  safety JSONB,
  employment JSONB,
  lifestyle JSONB,
  tourism JSONB,
  climate JSONB,

  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE (place_type, place_id)
);

CREATE INDEX IF NOT EXISTS idx_place_data_lookup ON place_data (place_type, place_id);
