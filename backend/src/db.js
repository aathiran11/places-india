import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

const isRemoteOrSsl =
  connectionString &&
  (connectionString.includes("sslmode=require") ||
    connectionString.includes("neon.tech") ||
    connectionString.includes("supabase.co") ||
    connectionString.includes("render.com") ||
    connectionString.includes("railway.app") ||
    process.env.NODE_ENV === "production" ||
    process.env.PGSSLMODE === "require" ||
    process.env.DATABASE_SSL === "true");

const pool = new Pool({
  connectionString,
  ssl: isRemoteOrSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("Unexpected DB error", err);
});

export default pool;
