import { Request, Response } from "express";
import { pool } from "../db/connection.js";

export async function getProfessorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, u.email, u.first_name, u.last_name 
       FROM professors p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Professor not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching professor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProfessorCourses(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, 
       COUNT(DISTINCT l.id) as lessons_count
       FROM courses c
       LEFT JOIN lessons l ON c.id = l.course_id
       WHERE c.professor_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching professor courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

