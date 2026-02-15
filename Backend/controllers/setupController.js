import { pool } from "../config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Initialize PostgreSQL database
// @route   GET /api/setup/initialize
// @access  Public (one-time use)
export const initializeDatabase = async (req, res) => {
  try {
    // Security check - only allow in production with correct key
    const setupKey = req.query.key;
    const expectedKey = process.env.SETUP_KEY || "flick-setup-2026";

    if (setupKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        message: "Invalid setup key",
      });
    }

    console.log("🚀 Starting database initialization...");

    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");

    // Read and execute SQL schema
    const schemaPath = path.join(__dirname, "..", "config", "postgresql-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("⚙️  Executing schema...");
    await pool.query(schema);
    console.log("✅ Database schema created successfully");

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = result.rows.map((row) => row.table_name);

    res.status(200).json({
      success: true,
      message: "Database initialized successfully!",
      tables: tables,
      defaultAdmin: {
        email: "admin@flick.com",
        password: "admin123",
        warning: "⚠️  Please change the admin password after first login!",
      },
    });
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    res.status(500).json({
      success: false,
      message: "Database initialization failed",
      error: error.message,
    });
  }
};

// @desc    Check database status
// @route   GET /api/setup/status
// @access  Public
export const checkDatabaseStatus = async (req, res) => {
  try {
    // Check if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = result.rows.map((row) => row.table_name);
    const expectedTables = [
      "users",
      "otp_verifications",
      "admins",
      "products",
      "cart_items",
      "orders",
      "order_items",
      "wishlist",
      "product_images",
      "admin_logs",
    ];

    const isInitialized = expectedTables.every((table) =>
      tables.includes(table)
    );

    res.status(200).json({
      success: true,
      initialized: isInitialized,
      tables: tables,
      expectedTables: expectedTables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check database status",
      error: error.message,
    });
  }
};
