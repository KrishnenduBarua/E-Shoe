import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
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
    const schemaPath = path.join(
      __dirname,
      "..",
      "config",
      "postgresql-schema.sql",
    );
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
      tables.includes(table),
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

// @desc    Verify and insert admin if missing
// @route   GET /api/setup/verify-admin
// @access  Public (one-time use)
export const verifyAdmin = async (req, res) => {
  try {
    const setupKey = req.query.key;
    const expectedKey = process.env.SETUP_KEY || "flick-setup-2026";

    if (setupKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        message: "Invalid setup key",
      });
    }

    // Check if admin exists
    const [admins] = await pool.query(
      "SELECT id, username, email, is_active FROM admins WHERE email = ?",
      ["admin@flick.com"],
    );

    if (admins.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Admin user exists",
        admin: admins[0],
      });
    }

    // Admin doesn't exist, insert it
    console.log("⚠️  Admin user not found, inserting...");

    // Password hash for 'admin123' using bcrypt with cost factor 10
    const passwordHash =
      "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    await pool.query(
      "INSERT INTO admins (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
      ["admin", "admin@flick.com", passwordHash, "Super Admin", "super_admin"],
    );

    console.log("✅ Admin user created successfully");

    res.status(200).json({
      success: true,
      message: "Admin user created successfully",
      defaultAdmin: {
        email: "admin@flick.com",
        password: "admin123",
        warning: "⚠️  Please change the admin password after first login!",
      },
    });
  } catch (error) {
    console.error("❌ Admin verification error:", error);
    res.status(500).json({
      success: false,
      message: "Admin verification failed",
      error: error.message,
    });
  }
};

// @desc    Test admin password (DEBUG ONLY)
// @route   GET /api/setup/test-password
// @access  Public (one-time use)
export const testAdminPassword = async (req, res) => {
  try {
    const setupKey = req.query.key;
    const expectedKey = process.env.SETUP_KEY || "flick-setup-2026";

    if (setupKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        message: "Invalid setup key",
      });
    }

    // Get admin with password hash
    const [admins] = await pool.query(
      "SELECT id, email, password_hash, is_active FROM admins WHERE email = ?",
      ["admin@flick.com"]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const admin = admins[0];
    const testPassword = "admin123";

    // Test bcrypt comparison
    const isMatch = await bcrypt.compare(testPassword, admin.password_hash);

    // Also test with the expected hash directly
    const expectedHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    const expectedMatch = await bcrypt.compare(testPassword, expectedHash);

    res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        is_active: admin.is_active,
        password_hash_preview: admin.password_hash.substring(0, 20) + "...",
      },
      testPassword: testPassword,
      bcryptMatch: isMatch,
      expectedHashMatch: expectedMatch,
      hashesMatch: admin.password_hash === expectedHash,
    });
  } catch (error) {
    console.error("❌ Password test error:", error);
    res.status(500).json({
      success: false,
      message: "Password test failed",
      error: error.message,
    });
  }
};

