import express from "express";
import {
  initializeDatabase,
  checkDatabaseStatus,
} from "../controllers/setupController.js";

const router = express.Router();

// Initialize database (one-time setup)
router.get("/initialize", initializeDatabase);

// Check database status
router.get("/status", checkDatabaseStatus);

export default router;
