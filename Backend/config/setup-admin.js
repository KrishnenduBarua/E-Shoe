import { pool } from "./database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupAdminTables = async () => {
  try {
    console.log("🔧 Setting up admin tables...\n");

    // Read the SQL file
    const sqlFile = path.join(__dirname, "admin-schema.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      // Skip the default admin insert (we'll do it separately with proper hash)
      if (statement.includes("INSERT INTO admins")) {
        continue;
      }
      await pool.query(statement);
    }

    console.log("✅ Admin tables created successfully\n");

    // Create default admin with properly hashed password
    console.log("👤 Creating default admin user...");
    const passwordHash = await bcrypt.hash("admin123", 10);

    try {
      await pool.query(
        `INSERT INTO admins (username, email, password_hash, full_name, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          "admin",
          "admin@eshoe.com",
          passwordHash,
          "Super Admin",
          "super_admin",
        ],
      );
      console.log("✅ Default admin created");
      console.log("📧 Email: admin@eshoe.com");
      console.log("🔑 Password: admin123");
      console.log("⚠️  Please change this password after first login!\n");
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log("ℹ️  Default admin already exists\n");
      } else {
        throw error;
      }
    }

    console.log("🎉 Admin setup completed!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up admin tables:", error.message);
    process.exit(1);
  }
};

setupAdminTables();
