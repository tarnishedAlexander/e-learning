import { pool } from "./connection.js";

async function seed() {
  try {
    console.log("🌱 Starting database seed...\n");

    // Create Admin user
    const adminUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
       RETURNING id, email`,
      [
        "admin@elearning.com",
        "$2b$10$dummyhash", // Dummy hash, you should implement proper password hashing
        "admin",
        "Admin",
        "User",
      ]
    );

    const adminUser = adminUserResult.rows[0];
    console.log(`✅ Admin user created/found - Email: ${adminUser.email}, ID: ${adminUser.id}`);

    // Create Professor user
    const professorUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
       RETURNING id, email`,
      [
        "professor@elearning.com",
        "$2b$10$dummyhash",
        "professor",
        "Test",
        "Professor",
      ]
    );

    const professorUser = professorUserResult.rows[0];
    console.log(`✅ Professor user created/found - Email: ${professorUser.email}, ID: ${professorUser.id}`);

    // Create Professor record linked to the user
    const professorResult = await pool.query(
      `INSERT INTO professors (user_id, bio, specialization)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, specialization = EXCLUDED.specialization
       RETURNING id`,
      [
        professorUser.id,
        "Test professor for development",
        "Computer Science",
      ]
    );

    const professorId = professorResult.rows[0].id;
    console.log(`✅ Professor record created/found - Professor ID: ${professorId}`);

    // Create Student user
    const studentUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
       RETURNING id, email`,
      [
        "student@elearning.com",
        "$2b$10$dummyhash",
        "student",
        "Test",
        "Student",
      ]
    );

    const studentUser = studentUserResult.rows[0];
    console.log(`✅ Student user created/found - Email: ${studentUser.email}, ID: ${studentUser.id}`);

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`\n📝 Default users created:`);
    console.log(`   Admin:    admin@elearning.com (ID: ${adminUser.id})`);
    console.log(`   Professor: professor@elearning.com (ID: ${professorUser.id}, Professor ID: ${professorId})`);
    console.log(`   Student:  student@elearning.com (ID: ${studentUser.id})`);
    console.log(`\n💡 Frontend usage:`);
    console.log(`   localStorage.setItem('userRole', 'admin')`);
    console.log(`   localStorage.setItem('userId', '${adminUser.id}')`);
    console.log(`   localStorage.setItem('professorId', '${professorId}')`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();

