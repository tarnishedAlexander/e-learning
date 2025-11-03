import { Request, Response } from "express";
import { pool } from "../db/connection.js";

export async function createCourse(req: Request, res: Response) {
  try {
    const { professor_id, title, description, thumbnail_url } = req.body;

    if (!professor_id || !title) {
      return res.status(400).json({ error: "professor_id and title are required" });
    }

    const result = await pool.query(
      `INSERT INTO courses (professor_id, title, description, thumbnail_url, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'published'))
       RETURNING *`,
      [professor_id, title, description || null, thumbnail_url || null, req.body.status || 'published']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCourseById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, 
       json_agg(
         json_build_object(
           'id', m.id,
           'title', m.title,
           'order_index', m.order_index,
           'lessons', (
             SELECT json_agg(
               json_build_object(
                 'id', l.id,
                 'title', l.title,
                 'description', l.description,
                 'order_index', l.order_index,
                 'duration_minutes', l.duration_minutes,
                 'video_url', l.video_url,
                 'thumbnail_url', l.thumbnail_url,
                 'status', l.status
               ) ORDER BY l.order_index
             )
             FROM lessons l
             WHERE l.module_id = m.id
           )
         ) ORDER BY m.order_index
       ) FILTER (WHERE m.id IS NOT NULL) as modules
       FROM courses c
       LEFT JOIN modules m ON c.id = m.course_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCoursesByProfessor(req: Request, res: Response) {
  try {
    const { professorId } = req.params;
    const result = await pool.query(
      `SELECT c.*, 
       COUNT(DISTINCT l.id) as lessons_count,
       COUNT(DISTINCT m.id) as modules_count
       FROM courses c
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN lessons l ON c.id = l.course_id
       WHERE c.professor_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [professorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateCourse(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url, status } = req.body;

    const result = await pool.query(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           thumbnail_url = COALESCE($3, thumbnail_url),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, description, thumbnail_url, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM courses WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addModuleToCourse(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { title, order_index } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    // Get max order_index if not provided
    let order = order_index;
    if (!order) {
      const maxResult = await pool.query(
        "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM modules WHERE course_id = $1",
        [courseId]
      );
      order = maxResult.rows[0].next_order;
    }

    const result = await pool.query(
      `INSERT INTO modules (course_id, title, order_index)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [courseId, title, order]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding module:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateModule(req: Request, res: Response) {
  try {
    const { moduleId } = req.params;
    const { title, order_index } = req.body;

    const result = await pool.query(
      `UPDATE modules 
       SET title = COALESCE($1, title),
           order_index = COALESCE($2, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [title, order_index, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating module:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteModule(req: Request, res: Response) {
  try {
    const { moduleId } = req.params;
    const result = await pool.query("DELETE FROM modules WHERE id = $1 RETURNING id", [moduleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

