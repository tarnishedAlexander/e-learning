import { Request, Response } from "express";
import { pool } from "../db/connection.js";

// Get all published courses (for browsing)
export async function getAvailableCourses(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT 
        c.*,
        p.user_id as professor_user_id,
        u.first_name || ' ' || u.last_name as professor_name,
        COUNT(DISTINCT l.id) as lessons_count,
        COUNT(DISTINCT m.id) as modules_count,
        COUNT(DISTINCT e.id) as enrolled_students_count
       FROM courses c
       JOIN professors p ON c.professor_id = p.id
       JOIN users u ON p.user_id = u.id
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN lessons l ON c.id = l.course_id AND l.status = 'ready'
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.status = 'published'
       GROUP BY c.id, p.user_id, u.first_name, u.last_name, c.description, c.thumbnail_url
       ORDER BY c.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching available courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get course details (for preview)
export async function getCoursePreview(req: Request, res: Response) {
  try {
    const { courseId } = req.params;

    const courseResult = await pool.query(
      `SELECT 
        c.*,
        p.user_id as professor_user_id,
        u.first_name || ' ' || u.last_name as professor_name,
        p.bio as professor_bio,
        p.specialization,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'ready') as lessons_count,
        COUNT(DISTINCT m.id) as modules_count,
        COUNT(DISTINCT e.id) as enrolled_students_count,
        COALESCE(SUM(l.duration_minutes), 0) as total_duration_minutes
       FROM courses c
       JOIN professors p ON c.professor_id = p.id
       JOIN users u ON p.user_id = u.id
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN lessons l ON c.id = l.course_id
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.id = $1
       GROUP BY c.id, p.user_id, u.first_name, u.last_name, p.bio, p.specialization`,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Get modules and lessons (only ready lessons for preview)
    const lessonsResult = await pool.query(
      `SELECT 
        l.*,
        m.title as module_title,
        m.order_index as module_order
       FROM lessons l
       LEFT JOIN modules m ON l.module_id = m.id
       WHERE l.course_id = $1 AND l.status = 'ready'
       ORDER BY COALESCE(m.order_index, 999), l.order_index`,
      [courseId]
    );

    res.json({
      ...courseResult.rows[0],
      lessons: lessonsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching course preview:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Enroll student in course
export async function enrollInCourse(req: Request, res: Response) {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ error: "studentId and courseId are required" });
    }

    // Check if course exists and is published
    const courseCheck = await pool.query(
      "SELECT id, status FROM courses WHERE id = $1",
      [courseId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (courseCheck.rows[0].status !== "published") {
      return res.status(400).json({ error: "Course is not available for enrollment" });
    }

    // Check if already enrolled
    const existingEnrollment = await pool.query(
      "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
      [studentId, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // Create enrollment
    const result = await pool.query(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [studentId, courseId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return res.status(400).json({ error: "Already enrolled in this course" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get student's enrolled courses
export async function getStudentEnrollments(req: Request, res: Response) {
  try {
    const { studentId } = req.params;

    const result = await pool.query(
      `SELECT 
        e.*,
        c.title,
        c.description,
        c.thumbnail_url,
        c.status,
        p.user_id as professor_user_id,
        u.first_name || ' ' || u.last_name as professor_name,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'ready') as total_lessons,
        COUNT(DISTINCT lp.lesson_id) as completed_lessons,
        e.progress_percentage
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN professors p ON c.professor_id = p.id
       JOIN users u ON p.user_id = u.id
       LEFT JOIN lessons l ON c.id = l.course_id AND l.status = 'ready'
       LEFT JOIN lesson_progress lp ON e.id = lp.enrollment_id
       WHERE e.student_id = $1
       GROUP BY e.id, c.id, p.user_id, u.first_name, u.last_name
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Check if student is enrolled in course
export async function checkEnrollment(req: Request, res: Response) {
  try {
    const { studentId, courseId } = req.params;

    const result = await pool.query(
      `SELECT e.*, c.status as course_status
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1 AND e.course_id = $2`,
      [studentId, courseId]
    );

    if (result.rows.length === 0) {
      return res.json({ enrolled: false });
    }

    res.json({ enrolled: true, enrollment: result.rows[0] });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get course details for enrolled student (with full access)
export async function getEnrolledCourseDetails(req: Request, res: Response) {
  try {
    const { studentId, courseId } = req.params;

    // Verify enrollment
    const enrollmentCheck = await pool.query(
      "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
      [studentId, courseId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not enrolled in this course" });
    }

    const enrollmentId = enrollmentCheck.rows[0].id;

    // Get course details
    const courseResult = await pool.query(
      `SELECT 
        c.*,
        p.user_id as professor_user_id,
        u.first_name || ' ' || u.last_name as professor_name,
        e.progress_percentage,
        e.enrolled_at
       FROM courses c
       JOIN professors p ON c.professor_id = p.id
       JOIN users u ON p.user_id = u.id
       JOIN enrollments e ON c.id = e.course_id
       WHERE c.id = $1 AND e.student_id = $2`,
      [courseId, studentId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Get modules
    const modulesResult = await pool.query(
      `SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index`,
      [courseId]
    );

    // Get lessons with progress
    const lessonsResult = await pool.query(
      `SELECT 
        l.id,
        l.course_id,
        l.module_id,
        l.title,
        l.description,
        l.order_index,
        l.duration_minutes,
        l.video_url,
        l.s3_key,
        l.thumbnail_url,
        l.status,
        l.created_at,
        l.updated_at,
        m.title as module_title,
        m.id as module_id,
        m.order_index as module_order,
        lp.completed_at IS NOT NULL as is_completed,
        lp.watched_duration_seconds
       FROM lessons l
       LEFT JOIN modules m ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON lp.enrollment_id = $1 AND lp.lesson_id = l.id
       WHERE l.course_id = $2 AND l.status = 'ready'
       ORDER BY COALESCE(m.order_index, 999), l.order_index`,
      [enrollmentId, courseId]
    );

    res.json({
      ...courseResult.rows[0],
      enrollment_id: enrollmentId,
      modules: modulesResult.rows,
      lessons: lessonsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching enrolled course details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Mark lesson as completed
export async function completeLesson(req: Request, res: Response) {
  try {
    const { enrollmentId, lessonId } = req.body;

    if (!enrollmentId || !lessonId) {
      return res.status(400).json({ error: "enrollmentId and lessonId are required" });
    }

    // Upsert lesson progress
    const result = await pool.query(
      `INSERT INTO lesson_progress (enrollment_id, lesson_id, completed_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (enrollment_id, lesson_id) 
       DO UPDATE SET completed_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [enrollmentId, lessonId]
    );

    // Update enrollment progress
    const enrollmentUpdate = await pool.query(
      `UPDATE enrollments
       SET progress_percentage = (
         SELECT ROUND(
           (COUNT(DISTINCT lp.lesson_id)::FLOAT / 
            NULLIF(COUNT(DISTINCT l.id), 0)::FLOAT) * 100
         )
         FROM lessons l
         LEFT JOIN lesson_progress lp ON lp.enrollment_id = enrollments.id AND lp.lesson_id = l.id
         WHERE l.course_id = (
           SELECT course_id FROM enrollments WHERE id = $1
         ) AND l.status = 'ready'
       )
       WHERE id = $1
       RETURNING *`,
      [enrollmentId]
    );

    res.json({
      lesson_progress: result.rows[0],
      enrollment: enrollmentUpdate.rows[0],
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

