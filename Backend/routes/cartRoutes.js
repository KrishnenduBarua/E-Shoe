import express from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCartController);
router.post("/add", addToCartController);
router.put("/:itemId", updateCartItemController);
router.delete("/:itemId", removeFromCartController);
router.delete("/", clearCartController);

export default router;
