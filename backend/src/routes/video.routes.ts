import { Router } from "express";
import multer from "multer";
import {
  uploadVideoToS3Route,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse,
  getVideoUrl,
} from "../controllers/video.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("video"), uploadVideoToS3Route);
router.post("/lessons", createLesson);
router.put("/lessons/:lessonId", updateLesson);
router.delete("/lessons/:lessonId", deleteLesson);
router.get("/lessons/course/:courseId", getLessonsByCourse);
router.get("/url", getVideoUrl); // Changed to query parameter

export { router as videoRoutes };

