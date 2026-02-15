import express from "express";
import {
  initializeDatabase,
  checkDatabaseStatus,
  verifyAdmin,
} from "../controllers/setupController.js";

const router = express.Router();

// Initialize database (one-time setup)
router.get("/initialize", initializeDatabase);

// Check database status
router.get("/status", checkDatabaseStatus);

// Verify and insert admin if missing
router.get("/verify-admin", verifyAdmin);

export default router;
