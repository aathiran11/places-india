import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  console.log("=== Initializing PlacesIndia Database ===");

  // 1. Phase 1 Schema
  console.log("[1/6] Applying Phase 1 schema...");
  const schema1 = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(schema1);

  // 2. Phase 2 Schema
  console.log("[2/6] Applying Phase 2 schema...");
  const schema2 = fs.readFileSync(path.join(__dirname, "schema_phase2.sql"), "utf-8");
  await pool.query(schema2);

  // 3. Phase 3 Schema
  console.log("[3/6] Applying Phase 3 schema...");
  const schema3 = fs.readFileSync(path.join(__dirname, "schema_phase3.sql"), "utf-8");
  await pool.query(schema3);

  // 4. Seed Data (states, places, admin user)
  console.log("[4/6] Seeding states, demo districts, and admin user...");
  const { states, demoDistricts } = await import("./seed/data.js");
  for (const s of states) {
    await pool.query(
      `INSERT INTO states (name, code, type, capital)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING`,
      [s.name, s.code, s.type, s.capital]
    );
  }

  for (const [stateName, districts] of Object.entries(demoDistricts)) {
    const { rows } = await pool.query("SELECT id FROM states WHERE name = $1", [stateName]);
    if (!rows.length) continue;
    const stateId = rows[0].id;

    for (const d of districts) {
      const districtRes = await pool.query(
        `INSERT INTO districts (name, state_id, headquarters)
         VALUES ($1, $2, $3)
         ON CONFLICT (name, state_id) DO UPDATE SET headquarters = EXCLUDED.headquarters
         RETURNING id`,
        [d.name, stateId, d.headquarters]
      );
      const districtId = districtRes.rows[0].id;

      for (const c of d.cities || []) {
        await pool.query(
          `INSERT INTO cities (name, district_id, type, population)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (name, district_id) DO UPDATE SET population = EXCLUDED.population`,
          [c.name, districtId, c.type, c.population]
        );
      }

      for (const v of d.villages || []) {
        await pool.query(
          `INSERT INTO villages (name, district_id, population)
           VALUES ($1, $2, $3)
           ON CONFLICT (name, district_id) DO UPDATE SET population = EXCLUDED.population`,
          [v.name, districtId, v.population]
        );
      }
    }
  }

  const bcryptModule = await import("bcryptjs");
  const bcrypt = bcryptModule.default || bcryptModule;
  const adminHash = await bcrypt.hash("admin123", 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ["Admin", "admin@placeplatform.in", adminHash, "admin"]
  );

  // 5. Place Profiles Data (Phase 2 & 2b)
  console.log("[5/6] Seeding place profiles & demographic data...");
  const { cityProfiles } = await import("./seed/phase2_data.js");
  for (const [cityName, data] of Object.entries(cityProfiles)) {
    const { rows } = await pool.query("SELECT id FROM cities WHERE name = $1", [cityName]);
    if (!rows.length) continue;
    const cityId = rows[0].id;
    await pool.query(
      `INSERT INTO place_data
         (place_type, place_id, population, economy, education, healthcare,
          infrastructure, environment, safety, employment, lifestyle, tourism, climate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (place_type, place_id) DO UPDATE SET
         population = EXCLUDED.population, economy = EXCLUDED.economy, education = EXCLUDED.education,
         healthcare = EXCLUDED.healthcare, infrastructure = EXCLUDED.infrastructure, environment = EXCLUDED.environment,
         safety = EXCLUDED.safety, employment = EXCLUDED.employment, lifestyle = EXCLUDED.lifestyle,
         tourism = EXCLUDED.tourism, climate = EXCLUDED.climate, updated_at = now()`,
      [
        "city",
        cityId,
        data.population || null,
        data.economy || null,
        data.education || null,
        data.healthcare || null,
        data.infrastructure || null,
        data.environment || null,
        data.safety || null,
        data.employment || null,
        data.lifestyle || null,
        data.tourism || null,
        data.climate || null,
      ]
    );
  }

  // 6. Coordinates for Map & ML Fields
  console.log("[6/6] Applying coordinates for map visualization and ML fields...");
  const { addCoordinates } = await import("./seed/add_coordinates.js");
  await addCoordinates(pool);

  const { addMlFields } = await import("./seed/add_ml_fields.js");
  await addMlFields(pool);

  console.log("=== Database successfully initialized with all phases! ===");
  await pool.end();
}

init().catch((err) => {
  console.error("Database initialization failed:", err);
  process.exit(1);
});
