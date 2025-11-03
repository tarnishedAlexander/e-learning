import { Router } from "express";
import {
  getAvailableCourses,
  getCoursePreview,
  enrollInCourse,
  getStudentEnrollments,
  checkEnrollment,
  getEnrolledCourseDetails,
  completeLesson,
} from "../controllers/enrollment.controller.js";

const router = Router();

// Public routes (for browsing courses)
router.get("/courses/available", getAvailableCourses);
router.get("/courses/:courseId/preview", getCoursePreview);

// Enrollment routes
router.post("/enroll", enrollInCourse);
router.get("/students/:studentId/enrollments", getStudentEnrollments);
router.get("/students/:studentId/courses/:courseId/enrollment", checkEnrollment);
router.get("/students/:studentId/courses/:courseId", getEnrolledCourseDetails);
router.post("/lessons/complete", completeLesson);

export { router as enrollmentRoutes };

