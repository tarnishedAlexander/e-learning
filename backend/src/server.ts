import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { professorRoutes } from "./routes/professor.routes.js";
import { courseRoutes } from "./routes/course.routes.js";
import { videoRoutes } from "./routes/video.routes.js";
import { enrollmentRoutes } from "./routes/enrollment.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/professor", professorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

