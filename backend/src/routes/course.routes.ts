import { Router } from "express";
import {
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByProfessor,
  addModuleToCourse,
  updateModule,
  deleteModule,
} from "../controllers/course.controller.js";

const router = Router();

router.post("/", createCourse);
router.get("/professor/:professorId", getCoursesByProfessor);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

// Module routes
router.post("/:courseId/modules", addModuleToCourse);
router.put("/modules/:moduleId", updateModule);
router.delete("/modules/:moduleId", deleteModule);

export { router as courseRoutes };

