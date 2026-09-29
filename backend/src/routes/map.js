import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/places/map-points — every state, district, city, and village
// that has coordinates, in one call (dataset is small enough not to need
// pagination or bounding-box filtering yet).
router.get("/map-points", async (req, res) => {
  try {
    const [states, districts, cities, villages] = await Promise.all([
      pool.query(
        `SELECT id, name, latitude, longitude, 'state' AS place_type
         FROM states WHERE latitude IS NOT NULL AND longitude IS NOT NULL`
      ),
      pool.query(
        `SELECT d.id, d.name, d.latitude, d.longitude, 'district' AS place_type, s.name AS state_name
         FROM districts d JOIN states s ON s.id = d.state_id
         WHERE d.latitude IS NOT NULL AND d.longitude IS NOT NULL`
      ),
      pool.query(
        `SELECT c.id, c.name, c.latitude, c.longitude, 'city' AS place_type,
                c.type AS city_type, c.population, d.name AS district_name, s.name AS state_name
         FROM cities c
         JOIN districts d ON d.id = c.district_id
         JOIN states s ON s.id = d.state_id
         WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL`
      ),
      pool.query(
        `SELECT v.id, v.name, v.latitude, v.longitude, 'village' AS place_type,
                v.population, d.name AS district_name, s.name AS state_name
         FROM villages v
         JOIN districts d ON d.id = v.district_id
         JOIN states s ON s.id = d.state_id
         WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL`
      ),
    ]);

    res.json({
      states: states.rows,
      districts: districts.rows,
      cities: cities.rows,
      villages: villages.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load map points" });
  }
});

export default router;
