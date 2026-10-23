import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/places/states — list all states/UTs
router.get("/states", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM states ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching states:", err);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// GET /api/places/states/:id — single state + its districts
router.get("/states/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const stateRes = await pool.query("SELECT * FROM states WHERE id = $1", [id]);
    if (!stateRes.rows.length) return res.status(404).json({ error: "State not found" });

    const districtsRes = await pool.query(
      "SELECT * FROM districts WHERE state_id = $1 ORDER BY name",
      [id]
    );

    res.json({ ...stateRes.rows[0], districts: districtsRes.rows });
  } catch (err) {
    console.error("Error fetching state:", err);
    res.status(500).json({ error: "Failed to fetch state details" });
  }
});

// GET /api/places/districts/:id — single district + its cities/villages
router.get("/districts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const districtRes = await pool.query(
      `SELECT d.*, s.name AS state_name FROM districts d
       JOIN states s ON s.id = d.state_id
       WHERE d.id = $1`,
      [id]
    );
    if (!districtRes.rows.length) return res.status(404).json({ error: "District not found" });

    const district = districtRes.rows[0];
    const citiesRes = await pool.query("SELECT * FROM cities WHERE district_id = $1 ORDER BY name", [id]);
    const villagesRes = await pool.query("SELECT * FROM villages WHERE district_id = $1 ORDER BY name", [id]);

    try {
      const dataRes = await pool.query(
        `SELECT population, economy, education, healthcare, infrastructure,
                environment, safety, employment, lifestyle, tourism, climate, updated_at
         FROM place_data WHERE place_type = 'district' AND place_id = $1`,
        [id]
      );
      district.profile = dataRes.rows[0] || null;
    } catch (err) {
      district.profile = null;
    }

    res.json({ ...district, cities: citiesRes.rows, villages: villagesRes.rows });
  } catch (err) {
    console.error("Error fetching district:", err);
    res.status(500).json({ error: "Failed to fetch district details" });
  }
});

// GET /api/places/cities/:id — single city profile
router.get("/cities/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT c.*, d.name AS district_name, s.name AS state_name, s.id AS state_id
       FROM cities c
       JOIN districts d ON d.id = c.district_id
       JOIN states s ON s.id = d.state_id
       WHERE c.id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "City not found" });

    const place = rows[0];

    try {
      const dataRes = await pool.query(
        `SELECT population, economy, education, healthcare, infrastructure,
                environment, safety, employment, lifestyle, tourism, climate, updated_at
         FROM place_data WHERE place_type = 'city' AND place_id = $1`,
        [id]
      );
      place.profile = dataRes.rows[0] || null;
    } catch (err) {
      place.profile = null;
    }

    res.json(place);
  } catch (err) {
    console.error("Error fetching city:", err);
    res.status(500).json({ error: "Failed to fetch city details" });
  }
});

// GET /api/places/villages/:id — single village profile
router.get("/villages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT v.*, d.name AS district_name, s.name AS state_name, s.id AS state_id
       FROM villages v
       JOIN districts d ON d.id = v.district_id
       JOIN states s ON s.id = d.state_id
       WHERE v.id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Village not found" });

    const place = rows[0];

    try {
      const dataRes = await pool.query(
        `SELECT population, economy, education, healthcare, infrastructure,
                environment, safety, employment, lifestyle, tourism, climate, updated_at
         FROM place_data WHERE place_type = 'village' AND place_id = $1`,
        [id]
      );
      place.profile = dataRes.rows[0] || null;
    } catch (err) {
      place.profile = null;
    }

    res.json(place);
  } catch (err) {
    console.error("Error fetching village:", err);
    res.status(500).json({ error: "Failed to fetch village details" });
  }
});

// GET /api/places/search?q=... — search across states, districts, cities, villages
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);
  const like = `%${q}%`;

  try {
    const [statesR, districtsR, citiesR, villagesR] = await Promise.all([
      pool.query("SELECT id, name, 'state' AS place_type FROM states WHERE name ILIKE $1 LIMIT 10", [like]),
      pool.query(
        `SELECT d.id, d.name, 'district' AS place_type, s.name AS state_name
         FROM districts d JOIN states s ON s.id = d.state_id
         WHERE d.name ILIKE $1 LIMIT 10`,
        [like]
      ),
      pool.query(
        `SELECT c.id, c.name, 'city' AS place_type, d.name AS district_name, s.name AS state_name
         FROM cities c
         JOIN districts d ON d.id = c.district_id
         JOIN states s ON s.id = d.state_id
         WHERE c.name ILIKE $1 LIMIT 10`,
        [like]
      ),
      pool.query(
        `SELECT v.id, v.name, 'village' AS place_type, d.name AS district_name, s.name AS state_name
         FROM villages v
         JOIN districts d ON d.id = v.district_id
         JOIN states s ON s.id = d.state_id
         WHERE v.name ILIKE $1 LIMIT 10`,
        [like]
      ),
    ]);

    res.json([...statesR.rows, ...districtsR.rows, ...citiesR.rows, ...villagesR.rows]);
  } catch (err) {
    console.error("Error in search:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
