import { pool } from "../config/database.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCartController = async (req, res, next) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCartController = async (req, res, next) => {
  try {
    const { productId, quantity = 1, selectedSize, selectedColor } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists and is active
    const [products] = await pool.query(
      "SELECT * FROM products WHERE id = ? AND is_active = TRUE",
      [productId],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    // Check stock
    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Check if item already exists in cart
    const [existingItems] = await pool.query(
      `SELECT * FROM cart_items 
       WHERE user_id = ? AND product_id = ? AND selected_size = ? AND selected_color = ?`,
      [req.user.id, productId, selectedSize || null, selectedColor || null],
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock for requested quantity",
        });
      }

      await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        newQuantity,
        existingItems[0].id,
      ]);

      return res.json({
        success: true,
        message: "Cart updated successfully",
      });
    }

    // Add new item to cart
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity, selected_size, selected_color)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        productId,
        quantity,
        selectedSize || null,
        selectedColor || null,
      ],
    );

    res.json({
      success: true,
      message: "Item added to cart successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItemController = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    // Get cart item with product info
    const [cartItems] = await pool.query(
      `SELECT ci.*, p.stock_quantity
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND ci.user_id = ?`,
      [itemId, req.user.id],
    );

    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Check stock
    if (cartItems[0].stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Update quantity
    await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
      quantity,
      itemId,
    ]);

    res.json({
      success: true,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCartController = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const [result] = await pool.query(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [itemId, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCartController = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};
