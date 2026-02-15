import express from "express";
import {
  getAllOrders,
  getOrderDetails,
  confirmOrder,
  rejectOrder,
  updateOrderStatus,
  getStats,
  getAllUsers,
  deleteUser,
} from "../controllers/adminOrderController.js";
import { protectAdmin, requireRole } from "../middleware/adminAuth.js";

const router = express.Router();

// All routes are protected
router.use(protectAdmin);

// Statistics
router.get("/stats", getStats);

// Order routes
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderDetails);
router.put("/orders/:id/confirm", confirmOrder);
router.put("/orders/:id/reject", rejectOrder);
router.put("/orders/:id/status", updateOrderStatus);

// User routes
router.get("/users", getAllUsers);
router.delete("/users/:id", requireRole("super_admin"), deleteUser);

export default router;
