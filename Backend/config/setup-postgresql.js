import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const setup = async () => {
  console.log("🚀 Setting up PostgreSQL database for Flick...\n");

  // Create PostgreSQL pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : false,
  });

  try {
    // Test connection
    console.log("📡 Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful!\n");

    // Read and execute SQL schema
    console.log("📝 Reading PostgreSQL schema...");
    const schemaPath = path.join(__dirname, "postgresql-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("⚙️  Executing schema...");
    await pool.query(schema);
    console.log("✅ Database schema created successfully!\n");

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("📊 Created tables:");
    result.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log("\n✅ PostgreSQL database setup completed successfully!");
    console.log("🔐 Default admin credentials:");
    console.log("   Email: admin@flick.com");
    console.log("   Password: admin123");
    console.log("   ⚠️  Please change the admin password after first login!\n");
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

setup();
