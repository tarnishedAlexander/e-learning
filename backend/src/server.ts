import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { professorRoutes } from "./routes/professor.routes.js";
import { courseRoutes } from "./routes/course.routes.js";
import { videoRoutes } from "./routes/video.routes.js";
import { enrollmentRoutes } from "./routes/enrollment.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { authRoutes } from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/professor", professorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Debug endpoint to check video URL
app.get("/api/debug/video", async (req, res) => {
  try {
    const s3Key = req.query.s3Key as string || "test-video.mp4";
    const region = process.env.AWS_REGION || "us-east-1";
    const bucket = process.env.AWS_S3_BUCKET_NAME || "thetarnisheds3";
    const accessPointAlias = process.env.AWS_S3_ACCESS_POINT_ALIAS;
    
    // URLs with bucket
    const bucketUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    
    // URLs with Access Point
    const accessPointUrl = accessPointAlias 
      ? `https://${accessPointAlias}.s3.${region}.amazonaws.com/${s3Key}`
      : null;
    
    // Try to get real URL
    let videoUrl = null;
    try {
      const { getVideoUrl } = await import("./services/s3.service.js");
      videoUrl = await getVideoUrl(s3Key);
    } catch (error: any) {
      console.error("Error getting video URL:", error.message);
    }
    
    // Test the URLs
    let bucketUrlStatus: string | number = "unknown";
    let videoUrlStatus: string | number = "unknown";
    
    try {
      const response = await fetch(bucketUrl, { method: 'HEAD' });
      bucketUrlStatus = response.status;
    } catch (e: any) {
      bucketUrlStatus = `error: ${e.message}`;
    }
    
    try {
      const response = await fetch(videoUrl || bucketUrl, { method: 'HEAD' });
      videoUrlStatus = response.status;
    } catch (e: any) {
      videoUrlStatus = `error: ${e.message}`;
    }
    
    res.json({
      s3Key,
      region,
      bucket,
      accessPointAlias,
      urls: {
        bucketUrl,
        bucketUrlStatus,
        accessPointUrl,
        videoUrl,
        videoUrlStatus
      },
      env: {
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
        AWS_S3_ACCESS_POINT_ALIAS: process.env.AWS_S3_ACCESS_POINT_ALIAS
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Debug failed", details: (error as any).message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

