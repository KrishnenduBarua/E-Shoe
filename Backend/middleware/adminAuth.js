import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

// Protect admin routes
export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies or Authorization header
    if (req.cookies.admin_token) {
      token = req.cookies.admin_token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get admin from database
      const [admins] = await pool.query(
        "SELECT id, username, email, full_name, role, is_active FROM admins WHERE id = ?",
        [decoded.id],
      );

      if (admins.length === 0 || !admins[0].is_active) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, admin not found or inactive",
        });
      }

      req.admin = admins[0];
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token verification failed",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Check if admin has specific role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
