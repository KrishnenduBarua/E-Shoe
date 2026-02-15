import express from "express";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  changeAdminPassword,
} from "../controllers/adminAuthController.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);

// Protected routes
router.post("/logout", protectAdmin, adminLogout);
router.get("/profile", protectAdmin, getAdminProfile);
router.put("/change-password", protectAdmin, changeAdminPassword);

export default router;
