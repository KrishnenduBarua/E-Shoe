import dotenv from "dotenv";

dotenv.config();

// Detect database type from environment
const DB_TYPE = process.env.DB_TYPE || "mysql"; // 'mysql' or 'postgresql'

let pool;

// PostgreSQL configuration (for production on Render)
if (DB_TYPE === "postgresql") {
  const pkg = await import("pg");
  const pg = pkg.default;

  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Wrap PostgreSQL query to convert MySQL-style placeholders and match MySQL result format
  const originalQuery = pool.query.bind(pool);
  pool.query = async (sql, params) => {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    let paramIndex = 0;
    const convertedSql = sql.replace(/\?/g, () => `$${++paramIndex}`);
    
    // Execute query
    const result = await originalQuery(convertedSql, params);
    
    // Return in MySQL format [rows, fields] for compatibility
    return [result.rows, result.fields];
  };
} else {
  // MySQL configuration (for local development)
  const mysql = await import("mysql2");

  const mysqlPool = mysql.default.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "eshoe",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  pool = mysqlPool.promise();
}

// Test database connection
const testConnection = async () => {
  try {
    if (DB_TYPE === "postgresql") {
      await pool.query("SELECT NOW()");
      console.log("✓ PostgreSQL Database connected successfully");
    } else {
      const connection = await pool.getConnection();
      console.log("✓ MySQL Database connected successfully");
      connection.release();
    }
    return true;
  } catch (error) {
    console.error(
      `✗ ${DB_TYPE === "postgresql" ? "PostgreSQL" : "MySQL"} connection failed:`,
      error.message,
    );
    return false;
  }
};

export { pool, testConnection };
