import { Router } from "express";
import multer from "multer";
import path from "path";
import pool from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { parseFile, processHierarchyRows, processPlaceDataRows } from "../import/importer.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.use(requireAuth, requireAdmin);

// --- Districts ---
router.post("/districts", async (req, res) => {
  const { name, state_id, headquarters } = req.body;
  if (!name || !state_id) return res.status(400).json({ error: "name and state_id are required" });
  const { rows } = await pool.query(
    `INSERT INTO districts (name, state_id, headquarters) VALUES ($1, $2, $3) RETURNING *`,
    [name, state_id, headquarters || null]
  );
  res.status(201).json(rows[0]);
});

router.put("/districts/:id", async (req, res) => {
  const { name, headquarters } = req.body;
  const { rows } = await pool.query(
    `UPDATE districts SET name = COALESCE($1, name), headquarters = COALESCE($2, headquarters)
     WHERE id = $3 RETURNING *`,
    [name, headquarters, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "District not found" });
  res.json(rows[0]);
});

router.delete("/districts/:id", async (req, res) => {
  await pool.query("DELETE FROM districts WHERE id = $1", [req.params.id]);
  res.status(204).send();
});

// --- Cities ---
router.post("/cities", async (req, res) => {
  const { name, district_id, type, population, latitude, longitude } = req.body;
  if (!name || !district_id) return res.status(400).json({ error: "name and district_id are required" });
  const { rows } = await pool.query(
    `INSERT INTO cities (name, district_id, type, population, latitude, longitude)
     VALUES ($1, $2, COALESCE($3, 'city'), $4, $5, $6) RETURNING *`,
    [name, district_id, type, population || null, latitude || null, longitude || null]
  );
  res.status(201).json(rows[0]);
});

router.put("/cities/:id", async (req, res) => {
  const { name, type, population, latitude, longitude } = req.body;
  const { rows } = await pool.query(
    `UPDATE cities SET
       name = COALESCE($1, name),
       type = COALESCE($2, type),
       population = COALESCE($3, population),
       latitude = COALESCE($4, latitude),
       longitude = COALESCE($5, longitude)
     WHERE id = $6 RETURNING *`,
    [name, type, population, latitude, longitude, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "City not found" });
  res.json(rows[0]);
});

router.delete("/cities/:id", async (req, res) => {
  await pool.query("DELETE FROM cities WHERE id = $1", [req.params.id]);
  res.status(204).send();
});

// --- Villages ---
router.post("/villages", async (req, res) => {
  const { name, district_id, population, latitude, longitude } = req.body;
  if (!name || !district_id) return res.status(400).json({ error: "name and district_id are required" });
  const { rows } = await pool.query(
    `INSERT INTO villages (name, district_id, population, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, district_id, population || null, latitude || null, longitude || null]
  );
  res.status(201).json(rows[0]);
});

router.delete("/villages/:id", async (req, res) => {
  await pool.query("DELETE FROM villages WHERE id = $1", [req.params.id]);
  res.status(204).send();
});

// --- Phase 3: Data Import Pipeline ---

// POST /api/admin/import — upload a CSV or JSON file and process it
router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded (field name: 'file')" });

  const importType = req.body.import_type;
  if (!["places_hierarchy", "place_data"].includes(importType)) {
    return res.status(400).json({ error: "import_type must be 'places_hierarchy' or 'place_data'" });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const format = ext === ".json" ? "json" : "csv";

  let rows;
  try {
    rows = parseFile(req.file.buffer, format);
  } catch (err) {
    return res.status(400).json({ error: `Failed to parse file: ${err.message}` });
  }

  if (!rows.length) {
    return res.status(400).json({ error: "File contains no rows" });
  }

  let result;
  try {
    result =
      importType === "places_hierarchy"
        ? await processHierarchyRows(rows)
        : await processPlaceDataRows(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Import failed: ${err.message}` });
  }

  const status = result.failed === 0 ? "success" : result.success === 0 ? "failed" : "partial";

  const logRes = await pool.query(
    `INSERT INTO imports
       (filename, import_type, format, status, rows_total, rows_success, rows_failed, errors, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      req.file.originalname,
      importType,
      format,
      status,
      result.total,
      result.success,
      result.failed,
      JSON.stringify(result.errors.slice(0, 100)), // cap stored errors
      req.user.id,
    ]
  );

  res.status(201).json(logRes.rows[0]);
});

// GET /api/admin/imports — recent import history
router.get("/imports", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT i.*, u.name AS created_by_name FROM imports i
     LEFT JOIN users u ON u.id = i.created_by
     ORDER BY i.created_at DESC LIMIT 30`
  );
  res.json(rows);
});

// GET /api/admin/scheduled-jobs — status of the background update checker
router.get("/scheduled-jobs", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM scheduled_jobs ORDER BY job_name");
  res.json(rows);
});


router.get("/stats", async (req, res) => {
  const [states, districts, cities, villages, users] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM states"),
    pool.query("SELECT COUNT(*) FROM districts"),
    pool.query("SELECT COUNT(*) FROM cities"),
    pool.query("SELECT COUNT(*) FROM villages"),
    pool.query("SELECT COUNT(*) FROM users"),
  ]);
  res.json({
    states: Number(states.rows[0].count),
    districts: Number(districts.rows[0].count),
    cities: Number(cities.rows[0].count),
    villages: Number(villages.rows[0].count),
    users: Number(users.rows[0].count),
  });
});

export default router;
