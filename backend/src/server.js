import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import placesRoutes from "./routes/places.js";
import similarRoutes from "./routes/similar.js";
import adminRoutes from "./routes/admin.js";
import rankingsRoutes from "./routes/rankings.js";
import { startScheduler } from "./scheduler.js";
import mapRoutes from "./routes/map.js"; 

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "https://places-india-zeta.vercel.app",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : []),
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoints
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Standard /api routes
app.use("/api/auth", authRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/places", rankingsRoutes); 
app.use("/api/places", similarRoutes);
app.use("/api/places", mapRoutes);
app.use("/api/admin", adminRoutes);

// Fallback direct routes (without /api) for full compatibility
app.use("/auth", authRoutes);
app.use("/places", placesRoutes);
app.use("/places", rankingsRoutes); 
app.use("/places", similarRoutes);
app.use("/places", mapRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  startScheduler();
});
