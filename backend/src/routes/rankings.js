import { Router } from "express";
import pool from "../db.js";

const router = Router();

const CATEGORIES = [
  "population",
  "economy",
  "education",
  "healthcare",
  "infrastructure",
  "environment",
  "safety",
  "employment",
  "lifestyle",
  "tourism",
  "climate",
];

// GET /api/places/rankings?place_type=city&category=safety&field=night_safety_score&order=desc&limit=10
router.get("/rankings", async (req, res) => {
  const placeType = req.query.place_type === "district" ? "district" : "city";
  const category = String(req.query.category || "");
  const field = String(req.query.field || "");
  const order = req.query.order === "asc" ? "asc" : "desc";
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(", ")}` });
  }
  if (!field) {
    return res.status(400).json({ error: "field is required" });
  }

  try {
    const joinClause =
      placeType === "city"
        ? `JOIN cities p ON p.id = pd.place_id
           JOIN districts d ON d.id = p.district_id
           JOIN states s ON s.id = d.state_id`
        : `JOIN districts p ON p.id = pd.place_id
           JOIN states s ON s.id = p.state_id`;

    const { rows } = await pool.query(
      `SELECT p.id, p.name, ${placeType === "city" ? "d.name AS district_name," : ""} s.name AS state_name,
              (pd.${category} ->> $1)::numeric AS value
       FROM place_data pd
       ${joinClause}
       WHERE pd.place_type = $2
         AND pd.${category} ? $1
         AND (pd.${category} ->> $1) ~ '^-?[0-9.]+$'
       ORDER BY value ${order === "asc" ? "ASC" : "DESC"}
       LIMIT $3`,
      [field, placeType, limit]
    );

    res.json({ place_type: placeType, category, field, order, results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute rankings" });
  }
});

export default router;
