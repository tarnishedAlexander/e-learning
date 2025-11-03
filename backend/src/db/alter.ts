import { pool } from "./connection.js";

async function alterUsers() {
  try {
    // Check if banned column exists, if not add it
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE
    `);
    
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP
    `);
    
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS banned_reason TEXT
    `);

    console.log("✅ Database schema updated successfully");
  } catch (error) {
    console.error("❌ Schema update failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

alterUsers();
