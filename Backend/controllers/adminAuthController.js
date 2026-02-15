import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers.js";

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const [admins] = await pool.query(
      "SELECT * FROM admins WHERE email = ? AND is_active = TRUE",
      [email],
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const admin = admins[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await pool.query("UPDATE admins SET last_login = NOW() WHERE id = ?", [
      admin.id,
    ]);

    // Generate token
    const token = generateToken(admin.id);

    // Set HTTP-only cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, ip_address) VALUES (?, ?, ?, ?)",
      [admin.id, "login", "auth", req.ip],
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Private (Admin)
export const adminLogout = async (req, res, next) => {
  try {
    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, ip_address) VALUES (?, ?, ?, ?)",
      [req.admin.id, "logout", "auth", req.ip],
    );

    res.clearCookie("admin_token");

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/auth/profile
// @access  Private (Admin)
export const getAdminProfile = async (req, res, next) => {
  try {
    const [admins] = await pool.query(
      "SELECT id, username, email, full_name, role, last_login, created_at FROM admins WHERE id = ?",
      [req.admin.id],
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admins[0].id,
          username: admins[0].username,
          email: admins[0].email,
          fullName: admins[0].full_name,
          role: admins[0].role,
          lastLogin: admins[0].last_login,
          createdAt: admins[0].created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private (Admin)
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get current admin
    const [admins] = await pool.query(
      "SELECT password_hash FROM admins WHERE id = ?",
      [req.admin.id],
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admins[0].password_hash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query("UPDATE admins SET password_hash = ? WHERE id = ?", [
      newPasswordHash,
      req.admin.id,
    ]);

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, ip_address) VALUES (?, ?, ?, ?)",
      [req.admin.id, "change_password", "auth", req.ip],
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
