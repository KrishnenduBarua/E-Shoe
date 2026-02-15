import express from "express";
import {
  createDirectOrderController,
  createOrderController,
  getUserOrdersController,
  getOrderByIdController,
  cancelOrderController,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes for guest checkout
router.post("/direct", createDirectOrderController);
router.post("/", createOrderController);

// Protected routes
router.use(protect);
router.get("/", getUserOrdersController);
router.get("/:id", getOrderByIdController);
router.post("/:id/cancel", cancelOrderController);

export default router;
