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

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/places", rankingsRoutes); 
app.use("/api/places", similarRoutes);
app.use("/api/places", mapRoutes);
app.use("/api/admin", adminRoutes);


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
