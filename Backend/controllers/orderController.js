import { pool } from "../config/database.js";
import { generateOrderNumber } from "../utils/helpers.js";

// @desc    Create direct order (single product, guest checkout)
// @route   POST /api/orders/direct
// @access  Public
export const createDirectOrderController = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const {
      productId,
      quantity,
      selectedSize,
      selectedColor,
      shippingInfo,
      paymentMethod = "COD",
      notes = "",
    } = req.body;

    // Validate required fields
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (!shippingInfo) {
      return res.status(400).json({
        success: false,
        message: "Shipping information is required",
      });
    }

    // Validate shipping info
    const requiredFields = ["name", "phone", "address", "city", "state"];
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        return res.status(400).json({
          success: false,
          message: `Shipping ${field} is required`,
        });
      }
    }

    // Get user ID if authenticated, otherwise null for guest
    const userId = req.user?.id || null;

    // Start transaction
    await connection.beginTransaction();

    // Get product details
    const [products] = await connection.query(
      "SELECT * FROM products WHERE id = ? AND is_active = TRUE",
      [productId],
    );

    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    // Check stock
    if (product.stock_quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for this product",
      });
    }

    // Calculate pricing
    const subtotal = product.price * quantity;
    const shippingCost = 120;
    const tax = 0;
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        user_id, guest_name, guest_phone, guest_email,
        order_number, status, order_status, subtotal, shipping_cost, tax, total_amount,
        shipping_name, shipping_phone, shipping_email, shipping_address, 
        shipping_city, shipping_state, shipping_zip, shipping_country,
        payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userId ? null : shippingInfo.name,
        userId ? null : shippingInfo.phone,
        userId ? null : shippingInfo.email || null,
        orderNumber,
        "pending",
        "pending",
        subtotal,
        shippingCost,
        tax,
        total,
        shippingInfo.name,
        shippingInfo.phone,
        shippingInfo.email || null,
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.state,
        shippingInfo.zip || "N/A",
        shippingInfo.country || "Bangladesh",
        paymentMethod,
        notes,
      ],
    );

    const orderId = orderResult.insertId;

    // Insert order item
    await connection.query(
      `INSERT INTO order_items (
        order_id, product_id, product_name, product_image,
        selected_size, selected_color, quantity, price, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        product.id,
        product.name,
        product.image_url,
        selectedSize,
        selectedColor,
        quantity,
        product.price,
        subtotal,
      ],
    );

    // Update product stock
    await connection.query(
      "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
      [quantity, productId],
    );

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        id: orderId,
        orderNumber,
        total,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (supports both logged-in and guest users)
export const createOrderController = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const {
      items,
      shippingInfo,
      paymentMethod = "COD",
      notes = "",
      isGuest = false,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!shippingInfo) {
      return res.status(400).json({
        success: false,
        message: "Shipping information is required",
      });
    }

    // Validate shipping info
    const requiredFields = ["name", "phone", "address", "city", "state"];
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        return res.status(400).json({
          success: false,
          message: `Shipping ${field} is required`,
        });
      }
    }

    // Get user ID if authenticated, otherwise null for guest
    const userId = req.user?.id || null;
    const guestName = isGuest || !userId ? shippingInfo.name : null;
    const guestPhone = isGuest || !userId ? shippingInfo.phone : null;
    const guestEmail = isGuest || !userId ? shippingInfo.email || null : null;

    // Start transaction
    await connection.beginTransaction();

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    // Validate and prepare order items
    for (const item of items) {
      const [products] = await connection.query(
        "SELECT * FROM products WHERE id = ? AND is_active = TRUE",
        [item.productId || item.id],
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId || item.id} not found`,
        });
      }

      const product = products[0];

      // Check stock
      if (product.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image_url,
        selectedSize: item.selectedSize || item.selected_size,
        selectedColor: item.selectedColor || item.selected_color,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      });
    }

    // Calculate shipping and tax
    const shippingCost = 120;
    const tax = 0;
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Insert order (with guest info if applicable)
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        user_id, guest_name, guest_phone, guest_email,
        order_number, status, order_status, subtotal, shipping_cost, tax, total_amount,
        shipping_name, shipping_phone, shipping_email, shipping_address, 
        shipping_city, shipping_state, shipping_zip, shipping_country,
        payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        guestName,
        guestPhone,
        guestEmail,
        orderNumber,
        "pending",
        "pending",
        subtotal,
        shippingCost,
        tax,
        total,
        shippingInfo.name,
        shippingInfo.phone,
        shippingInfo.email || null,
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.state,
        shippingInfo.zip || "N/A",
        shippingInfo.country || "Bangladesh",
        paymentMethod,
        notes,
      ],
    );

    const orderId = orderResult.insertId;

    // Insert order items and update stock
    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_image,
          selected_size, selected_color, quantity, price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.productImage,
          item.selectedSize,
          item.selectedColor,
          item.quantity,
          item.price,
          item.subtotal,
        ],
      );

      // Update product stock
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.productId],
      );
    }

    // Clear user's cart
    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [
      req.user.id,
    ]);

    // Commit transaction
    await connection.commit();

    // Fetch the created order
    const [orders] = await pool.query(`SELECT * FROM orders WHERE id = ?`, [
      orderId,
    ]);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: orders[0],
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrdersController = async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get order items
    const [items] = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id],
    );

    res.json({
      success: true,
      data: {
        ...orders[0],
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
export const cancelOrderController = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Get order
    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    // Check if order can be cancelled
    if (order.status === "delivered" || order.status === "cancelled") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${order.status} order`,
      });
    }

    // Get order items
    const [items] = await connection.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id],
    );

    // Restore stock
    for (const item of items) {
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
        [item.quantity, item.product_id],
      );
    }

    // Update order status
    await connection.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = ?",
      [id],
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
