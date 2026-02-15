import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const [users] = await pool.query(
        "SELECT id, phone_number, name, email, is_verified FROM users WHERE id = ?",
        [decoded.id],
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = users[0];
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await pool.query(
          "SELECT id, phone_number, name, email, is_verified FROM users WHERE id = ?",
          [decoded.id],
        );

        if (users.length > 0) {
          req.user = users[0];
        }
      } catch (error) {
        // Token invalid, but we continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
