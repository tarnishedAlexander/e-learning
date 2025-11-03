import { Request, Response } from "express";
import { pool } from "../db/connection.js";
import { uploadVideoToS3 } from "../services/s3.service.js";

export async function uploadVideoToS3Route(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    const fileName = req.file.originalname || `video-${Date.now()}.mp4`;
    const s3Key = await uploadVideoToS3(req.file.buffer, fileName, req.file.mimetype);

    res.json({
      message: "Video uploaded successfully",
      s3_key: s3Key,
      file_name: fileName,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Failed to upload video to S3" });
  }
}

export async function createLesson(req: Request, res: Response) {
  try {
    const {
      course_id,
      module_id,
      title,
      description,
      order_index,
      duration_minutes,
      s3_key,
      video_url,
      thumbnail_url,
    } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ error: "course_id and title are required" });
    }

    // Get max order_index if not provided
    let order = order_index;
    if (!order) {
      const maxResult = await pool.query(
        `SELECT COALESCE(MAX(order_index), 0) + 1 as next_order 
         FROM lessons 
         WHERE course_id = $1 ${module_id ? "AND module_id = $2" : ""}`,
        module_id ? [course_id, module_id] : [course_id]
      );
      order = maxResult.rows[0].next_order;
    }

    const result = await pool.query(
      `INSERT INTO lessons (
        course_id, module_id, title, description, order_index, 
        duration_minutes, s3_key, video_url, thumbnail_url
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        course_id,
        module_id || null,
        title,
        description || null,
        order,
        duration_minutes || 5,
        s3_key || null,
        video_url || null,
        thumbnail_url || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateLesson(req: Request, res: Response) {
  try {
    const { lessonId } = req.params;
    const {
      title,
      description,
      order_index,
      duration_minutes,
      s3_key,
      video_url,
      thumbnail_url,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE lessons 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index),
           duration_minutes = COALESCE($4, duration_minutes),
           s3_key = COALESCE($5, s3_key),
           video_url = COALESCE($6, video_url),
           thumbnail_url = COALESCE($7, thumbnail_url),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description,
        order_index,
        duration_minutes,
        s3_key,
        video_url,
        thumbnail_url,
        status,
        lessonId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteLesson(req: Request, res: Response) {
  try {
    const { lessonId } = req.params;
    const result = await pool.query("DELETE FROM lessons WHERE id = $1 RETURNING id", [lessonId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getLessonsByCourse(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      `SELECT * FROM lessons 
       WHERE course_id = $1 
       ORDER BY order_index ASC`,
      [courseId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getVideoUrl(req: Request, res: Response) {
  try {
    // Get s3Key from query parameter instead of path parameter
    const s3Key = req.query.s3Key as string;

    if (!s3Key) {
      return res.status(400).json({ error: "s3Key query parameter is required" });
    }

    console.log("🎬 Getting video URL for s3Key:", s3Key);

    try {
      const { getVideoUrl } = await import("../services/s3.service.js");
      const videoUrl = await getVideoUrl(s3Key);

      console.log("✅ Generated video URL successfully");
      res.json({ video_url: videoUrl });
    } catch (error: any) {
      console.error("❌ Error generating signed URL, trying alternative method:", error.message);
      
      // Alternative: Generate signed URL using a different approach
      try {
        const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        
        const s3Client = new S3Client({
          region: process.env.AWS_REGION || "us-east-1",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        // Use Access Point alias if available
        const bucketOrAccessPoint = process.env.AWS_S3_ACCESS_POINT_ALIAS || process.env.AWS_S3_BUCKET_NAME || "thetarnisheds3";

        const command = new GetObjectCommand({
          Bucket: bucketOrAccessPoint,
          Key: s3Key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        console.log("✅ Alternative signed URL generated successfully");
        return res.json({ video_url: signedUrl });
      } catch (altError: any) {
        console.error("❌ Alternative method also failed:", altError.message);
      }

      // Final fallback: Return direct S3 URL (use bucket, not Access Point, for reads)
      const region = process.env.AWS_REGION || "us-east-1";
      const bucket = process.env.AWS_S3_BUCKET_NAME || "thetarnisheds3";
      
      // Always use bucket for reads (public access)
      const directUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
      
      console.log("⚠️ Falling back to direct S3 URL:", directUrl);
      res.json({ video_url: directUrl });
    }
  } catch (error: any) {
    console.error("Error getting video URL:", error);
    res.status(500).json({ 
      error: "Failed to get video URL",
      details: error.message || "Unknown error"
    });
  }
}

