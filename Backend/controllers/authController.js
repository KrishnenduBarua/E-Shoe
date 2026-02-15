import { pool } from "../config/database.js";
import {
  generateToken,
  generateOTP,
  getOTPExpiration,
  sendOTP,
  validatePhoneNumber,
} from "../utils/helpers.js";

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTPController = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Delete any existing OTPs for this phone number
    await pool.query("DELETE FROM otp_verifications WHERE phone_number = ?", [
      phoneNumber,
    ]);

    // Store OTP in database
    await pool.query(
      "INSERT INTO otp_verifications (phone_number, otp_code, expires_at) VALUES (?, ?, ?)",
      [phoneNumber, otp, expiresAt],
    );

    // Send OTP via SMS (mock)
    await sendOTP(phoneNumber, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        phoneNumber,
        expiresIn: process.env.OTP_EXPIRE_MINUTES || 5,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login/register user
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTPController = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // Verify OTP
    const [otpRecords] = await pool.query(
      `SELECT * FROM otp_verifications 
       WHERE phone_number = ? AND otp_code = ? AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phoneNumber, otp],
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as used
    await pool.query(
      "UPDATE otp_verifications SET is_used = TRUE WHERE id = ?",
      [otpRecords[0].id],
    );

    // Check if user exists
    let [users] = await pool.query(
      "SELECT * FROM users WHERE phone_number = ?",
      [phoneNumber],
    );

    let user;
    let isNewUser = false;

    if (users.length === 0) {
      // Create new user
      const [result] = await pool.query(
        "INSERT INTO users (phone_number, is_verified) VALUES (?, TRUE)",
        [phoneNumber],
      );

      [users] = await pool.query(
        "SELECT id, phone_number, name, email, is_verified FROM users WHERE id = ?",
        [result.insertId],
      );

      user = users[0];
      isNewUser = true;
    } else {
      // Update existing user verification
      await pool.query(
        "UPDATE users SET is_verified = TRUE WHERE phone_number = ?",
        [phoneNumber],
      );

      user = users[0];
    }

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: isNewUser ? "Account created successfully" : "Login successful",
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          name: user.name,
          email: user.email,
          isVerified: user.is_verified,
        },
        token,
        isNewUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutController = async (req, res, next) => {
  try {
    res.cookie("auth_token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfileController = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT id, phone_number, name, email, address, city, state, zip_code, 
              country, is_verified, created_at 
       FROM users WHERE id = ?`,
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfileController = async (req, res, next) => {
  try {
    const { name, email, address, city, state, zipCode, country } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      values.push(address);
    }
    if (city !== undefined) {
      updates.push("city = ?");
      values.push(city);
    }
    if (state !== undefined) {
      updates.push("state = ?");
      values.push(state);
    }
    if (zipCode !== undefined) {
      updates.push("zip_code = ?");
      values.push(zipCode);
    }
    if (country !== undefined) {
      updates.push("country = ?");
      values.push(country);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    values.push(req.user.id);

    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const [users] = await pool.query(
      `SELECT id, phone_number, name, email, address, city, state, zip_code, 
              country, is_verified, created_at 
       FROM users WHERE id = ?`,
      [req.user.id],
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: users[0],
    });
  } catch (error) {
    next(error);
  }
};
