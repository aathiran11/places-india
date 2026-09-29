# PlacesIndia — Phase 1: Foundation

An AI-powered place analysis platform for India. This is **Phase 1** of the 10-phase
roadmap: user auth, the India → State → District → City/Town → Village hierarchy,
search, basic place profiles, and an admin dashboard.

Scope for Phase 1: all 28 states + 8 UTs are seeded. Full district/city/village data is
only pre-loaded for a handful of states (Tamil Nadu, Karnataka, Maharashtra, Delhi) as a
working demo — nationwide district-level data collection is Phase 3.

## Stack

- Backend: Node.js + Express + PostgreSQL (raw SQL via `pg`, no ORM yet)
- Frontend: React + TypeScript + Tailwind CSS (Vite)
- Auth: JWT + bcrypt

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally

## 1. Database setup

Create the database:

```bash
createdb place_platform
```

Apply the schema:

```bash
psql -d place_platform -f backend/src/db/schema.sql
```

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env if your Postgres user/password/port differ from the default
npm install
npm run seed   # loads all states/UTs + demo districts/cities/villages + an admin user
npm run dev    # starts API on http://localhost:5000
```

Demo admin login (created by the seed script):

```
email: admin@placeplatform.in
password: admin123
```

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev    # starts UI on http://localhost:5173
```

Open http://localhost:5173.

## What you can do in Phase 1

- Browse India → States/UTs → Districts → Cities/Towns/Villages
- Search any place by name (autocomplete dropdown)
- View a basic profile page for any city, town, or village
- Register/login as a user
- Log in as admin and add new districts/cities/villages via the Admin Dashboard
- View live counts of states, districts, cities, villages, and users

## What's intentionally NOT in Phase 1

- Any real statistics (economy, safety, environment, healthcare, etc.) — that's Phase 2
- Charts, maps, images — Phase 2 / Phase 7
- Bulk data import (CSV/JSON) — Phase 3
- Rankings, trends, comparisons — Phase 4 / Phase 5
- ML predictions, AI-written summaries — Phase 6 / Phase 8

## Project structure

```
place-platform/
  backend/
    src/
      db.js              # PostgreSQL connection pool
      db/schema.sql       # Phase 1 schema
      db/seed/            # seed data + seed runner
      middleware/auth.js  # JWT auth + admin guard
      routes/
        auth.js           # register/login
        places.js         # browse + search + profiles (public)
        admin.js           # CRUD for districts/cities/villages (admin only)
      server.js
  frontend/
    src/
      lib/api.ts          # typed fetch client
      lib/auth.tsx         # auth context (login/register/logout)
      components/         # Navbar, SearchBar
      pages/               # Home, StatePage, DistrictPage, CityProfile,
                           # VillageProfile, Login, Register, AdminDashboard
      App.tsx
```

## Next: Phase 2

Phase 2 adds real data modules (population, economy, education, healthcare,
infrastructure, environment, safety, employment, lifestyle, tourism, climate) to each
place profile, with tables, charts, and maps — starting with the states/districts
already seeded here (Tamil Nadu is the natural first target given the demo data).
