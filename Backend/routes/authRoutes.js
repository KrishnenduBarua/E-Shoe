import express from "express";
import {
  sendOTPController,
  verifyOTPController,
  logoutController,
  getProfileController,
  updateProfileController,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/send-otp", sendOTPController);
router.post("/verify-otp", verifyOTPController);

// Protected routes
router.post("/logout", protect, logoutController);
router.get("/profile", protect, getProfileController);
router.put("/profile", protect, updateProfileController);

export default router;
