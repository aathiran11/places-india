-- Phase 1: Foundation schema
-- Hierarchy: India -> State -> District -> City/Town -> Village

CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT,                -- e.g. 'TN', 'KA'
  type TEXT DEFAULT 'state' CHECK (type IN ('state', 'union_territory')),
  capital TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  headquarters TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (name, state_id)
);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'city' CHECK (type IN ('city', 'town')),
  population BIGINT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (name, district_id)
);

CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  population BIGINT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (name, district_id)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT now()
);

-- Helpful indexes for search
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_villages_name ON villages USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_states_name ON states (name);
