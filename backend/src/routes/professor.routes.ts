import { Router } from "express";
import { getProfessorCourses, getProfessorById } from "../controllers/professor.controller.js";

const router = Router();

router.get("/:id/courses", getProfessorCourses);
router.get("/:id", getProfessorById);

export { router as professorRoutes };

