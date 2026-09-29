import "dotenv/config";
import pool from "../../db.js";
import { states, demoDistricts } from "./data.js";

async function seed() {
  console.log("Seeding states...");
  for (const s of states) {
    await pool.query(
      `INSERT INTO states (name, code, type, capital)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING`,
      [s.name, s.code, s.type, s.capital]
    );
  }

  console.log("Seeding demo districts/cities/villages...");
  for (const [stateName, districts] of Object.entries(demoDistricts)) {
    const { rows } = await pool.query("SELECT id FROM states WHERE name = $1", [stateName]);
    if (!rows.length) {
      console.warn(`State not found: ${stateName}, skipping its districts.`);
      continue;
    }
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

  console.log("Seeding admin user (admin@placeplatform.in / admin123)...");
  const bcryptModule = await import("bcryptjs");
  const bcrypt = bcryptModule.default || bcryptModule;
  const hash = await bcrypt.hash("admin123", 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ["Admin", "admin@placeplatform.in", hash]
  );

  console.log("Seed complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
