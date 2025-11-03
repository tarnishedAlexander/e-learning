import { Router } from "express";
import {
  getStudents,
  getStudentDetails,
  banStudent,
  deleteStudent,
  getProfessors,
  getProfessorDetails,
  banProfessor,
  deleteProfessor,
} from "../controllers/admin.controller.js";

const router = Router();

// Students routes
router.get("/students", getStudents);
router.get("/students/:studentId", getStudentDetails);
router.put("/students/:studentId/ban", banStudent);
router.delete("/students/:studentId", deleteStudent);

// Professors routes
router.get("/professors", getProfessors);
router.get("/professors/:professorId", getProfessorDetails);
router.put("/professors/:professorId/ban", banProfessor);
router.delete("/professors/:professorId", deleteProfessor);

export { router as adminRoutes };

