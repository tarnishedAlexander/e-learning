import { Request, Response } from "express";
import { pool } from "../db/connection.js";

// Get all students
export async function getStudents(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.banned,
        u.banned_at,
        u.banned_reason,
        u.created_at,
        COUNT(DISTINCT e.id) as total_enrollments,
        COUNT(DISTINCT lp.id) as completed_lessons
       FROM users u
       LEFT JOIN enrollments e ON u.id = e.student_id
       LEFT JOIN lesson_progress lp ON e.id = lp.enrollment_id
       WHERE u.role = 'student'
       GROUP BY u.id, u.email, u.first_name, u.last_name, u.banned, u.banned_at, u.banned_reason, u.created_at
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get student details with enrollments and progress
export async function getStudentDetails(req: Request, res: Response) {
  try {
    const { studentId } = req.params;

    // Get student info
    const studentResult = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND role = 'student'`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const student = studentResult.rows[0];

    // Get enrollments with progress
    const enrollmentsResult = await pool.query(
      `SELECT 
        e.*,
        c.title as course_title,
        c.description as course_description,
        c.thumbnail_url,
        p.user_id as professor_user_id,
        u2.first_name || ' ' || u2.last_name as professor_name,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'ready') as total_lessons,
        COUNT(DISTINCT lp.lesson_id) as completed_lessons,
        e.progress_percentage
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN professors p ON c.professor_id = p.id
       JOIN users u2 ON p.user_id = u2.id
       LEFT JOIN lessons l ON c.id = l.course_id AND l.status = 'ready'
       LEFT JOIN lesson_progress lp ON e.id = lp.enrollment_id
       WHERE e.student_id = $1
       GROUP BY e.id, c.id, p.user_id, u2.first_name, u2.last_name
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );

    res.json({
      student,
      enrollments: enrollmentsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Ban/Unban student
export async function banStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const { banned, reason } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET banned = $1,
           banned_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END,
           banned_reason = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND role = 'student'
       RETURNING *`,
      [banned === true || banned === "true", reason || null, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error banning student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get all professors
export async function getProfessors(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.banned,
        u.banned_at,
        u.banned_reason,
        u.created_at,
        p.id as professor_id,
        p.bio,
        p.specialization,
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT e.id) as total_enrollments
       FROM users u
       JOIN professors p ON u.id = p.user_id
       LEFT JOIN courses c ON p.id = c.professor_id
       LEFT JOIN lessons l ON c.id = l.course_id
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE u.role = 'professor'
       GROUP BY u.id, u.email, u.first_name, u.last_name, u.banned, u.banned_at, u.banned_reason, u.created_at, p.id, p.bio, p.specialization
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching professors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get professor details with courses
export async function getProfessorDetails(req: Request, res: Response) {
  try {
    const { professorId } = req.params;

    // Get professor info
    const professorResult = await pool.query(
      `SELECT 
        u.*,
        p.id as professor_id,
        p.bio,
        p.specialization
       FROM users u
       JOIN professors p ON u.id = p.user_id
       WHERE u.id = $1 AND u.role = 'professor'`,
      [professorId]
    );

    if (professorResult.rows.length === 0) {
      return res.status(404).json({ error: "Professor not found" });
    }

    const professor = professorResult.rows[0];

    // Get courses
    const coursesResult = await pool.query(
      `SELECT 
        c.*,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'ready') as lessons_count,
        COUNT(DISTINCT m.id) as modules_count,
        COUNT(DISTINCT e.id) as enrollments_count
       FROM courses c
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN lessons l ON c.id = l.course_id
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.professor_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [professor.professor_id]
    );

    res.json({
      professor,
      courses: coursesResult.rows,
    });
  } catch (error) {
    console.error("Error fetching professor details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Ban/Unban professor
export async function banProfessor(req: Request, res: Response) {
  try {
    const { professorId } = req.params;
    const { banned, reason } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET banned = $1,
           banned_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END,
           banned_reason = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND role = 'professor'
       RETURNING *`,
      [banned === true || banned === "true", reason || null, professorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Professor not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error banning professor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete professor (cascade deletes courses, lessons, etc.)
export async function deleteProfessor(req: Request, res: Response) {
  try {
    const { professorId } = req.params;

    // First get professor info for response
    const professorCheck = await pool.query(
      `SELECT u.id, p.id as professor_id 
       FROM users u
       JOIN professors p ON u.id = p.user_id
       WHERE u.id = $1 AND u.role = 'professor'`,
      [professorId]
    );

    if (professorCheck.rows.length === 0) {
      return res.status(404).json({ error: "Professor not found" });
    }

    // Delete user (cascade will delete professor, courses, etc.)
    await pool.query("DELETE FROM users WHERE id = $1", [professorId]);

    res.json({ message: "Professor deleted successfully" });
  } catch (error) {
    console.error("Error deleting professor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete student
export async function deleteStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const studentCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'student'",
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete user (cascade will delete enrollments, etc.)
    await pool.query("DELETE FROM users WHERE id = $1", [studentId]);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

