import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function setupDatabase() {
  let connection;

  try {
    console.log("🔌 Connecting to MySQL...");

    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "12345678",
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
    });

    console.log("✓ Connected to MySQL");

    // Use the eshoe database
    console.log("📊 Using database: eshoe");
    await connection.query(`USE ${process.env.DB_NAME || "eshoe"}`);

    // Read and execute SQL schema
    console.log("📝 Reading database schema...");
    const sqlFile = fs.readFileSync(
      path.join(__dirname, "database.sql"),
      "utf8",
    );

    console.log("🔨 Creating tables...");
    await connection.query(sqlFile);

    console.log("✅ Database setup completed successfully!");
    console.log("\nTables created:");
    console.log("  ✓ users");
    console.log("  ✓ otp_verifications");
    console.log("  ✓ categories");
    console.log("  ✓ products");
    console.log("  ✓ cart_items");
    console.log("  ✓ orders");
    console.log("  ✓ order_items");
    console.log("  ✓ wishlist");
    console.log('\n💡 Next step: Run "npm run seed" to add sample data');
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
