import { pool } from "../config/database.js";

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || "";
    const search = req.query.search || "";

    let query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.phone_number as user_phone,
        u.email as user_email,
        a.full_name as confirmed_by_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN admins a ON o.confirmed_by = a.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += " AND o.order_status = ?";
      params.push(status);
    }

    if (search) {
      query +=
        " AND (o.order_number LIKE ? OR o.shipping_name LIKE ? OR o.shipping_phone LIKE ? OR u.name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [orders] = await pool.query(query, params);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1";
    const countParams = [];

    if (status) {
      countQuery += " AND o.order_status = ?";
      countParams.push(status);
    }

    if (search) {
      countQuery +=
        " AND (o.order_number LIKE ? OR o.shipping_name LIKE ? OR o.shipping_phone LIKE ? OR u.name LIKE ?)";
      countParams.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      );
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private (Admin)
export const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get order details
    const [orders] = await pool.query(
      `SELECT 
        o.*,
        u.name as user_name,
        u.phone_number as user_phone,
        u.email as user_email,
        a.full_name as confirmed_by_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN admins a ON o.confirmed_by = a.id
      WHERE o.id = ?`,
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get order items
    const [items] = await pool.query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image_url as product_image,
        p.slug as product_slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [id],
    );

    res.json({
      success: true,
      data: {
        order: orders[0],
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm order
// @route   PUT /api/admin/orders/:id/confirm
// @access  Private (Admin)
export const confirmOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if order exists
    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [
      id,
    ]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    if (order.order_status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Order is already confirmed",
      });
    }

    if (
      order.order_status === "cancelled" ||
      order.order_status === "rejected"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm a ${order.order_status} order`,
      });
    }

    // Update order
    await pool.query(
      `UPDATE orders SET
        order_status = 'confirmed',
        status = 'processing',
        admin_notes = ?,
        confirmed_by = ?,
        confirmed_at = NOW()
      WHERE id = ?`,
      [notes || null, req.admin.id, id],
    );

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        req.admin.id,
        "confirm_order",
        "order",
        id,
        `Confirmed order: ${order.order_number}`,
      ],
    );

    res.json({
      success: true,
      message: "Order confirmed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject order
// @route   PUT /api/admin/orders/:id/reject
// @access  Private (Admin)
export const rejectOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // Check if order exists
    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [
      id,
    ]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    if (order.order_status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Order is already rejected",
      });
    }

    if (order.order_status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot reject a delivered order",
      });
    }

    // Start transaction for stock restoration
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Restore stock
      const [items] = await connection.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [id],
      );

      for (const item of items) {
        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
          [item.quantity, item.product_id],
        );
      }

      // Update order
      await connection.query(
        `UPDATE orders SET
          order_status = 'rejected',
          status = 'cancelled',
          admin_notes = ?,
          confirmed_by = ?,
          confirmed_at = NOW()
        WHERE id = ?`,
        [notes, req.admin.id, id],
      );

      await connection.commit();

      // Log activity
      await pool.query(
        "INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          req.admin.id,
          "reject_order",
          "order",
          id,
          `Rejected order: ${order.order_number}`,
        ],
      );

      res.json({
        success: true,
        message: "Order rejected and stock restored",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "rejected",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(", ")}`,
      });
    }

    // Check if order exists
    const [orders] = await pool.query(
      "SELECT order_number FROM orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order
    await pool.query(
      `UPDATE orders SET
        order_status = ?,
        admin_notes = COALESCE(?, admin_notes)
      WHERE id = ?`,
      [status, notes, id],
    );

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        req.admin.id,
        "update_order_status",
        "order",
        id,
        `Updated order ${orders[0].order_number} to ${status}`,
      ],
    );

    res.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res, next) => {
  try {
    // Get order stats
    const [orderStats] = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN order_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
        SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN order_status = 'delivered' THEN total ELSE 0 END), 0) as delivered_revenue
      FROM orders
    `);

    // Get product stats
    const [productStats] = await pool.query(`
      SELECT
        COUNT(*) as total_products,
        COALESCE(SUM(stock_quantity), 0) as total_stock,
        SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_products
      FROM products
    `);

    // Get user stats
    const [userStats] = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30days
      FROM users
    `);

    // Get recent orders
    const [recentOrders] = await pool.query(`
      SELECT 
        o.id, o.order_number, o.shipping_name, o.shipping_phone, 
        o.total, o.order_status, o.created_at,
        COALESCE(u.name, o.guest_name) as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalOrders: orderStats[0].total_orders || 0,
        pendingOrders: orderStats[0].pending_orders || 0,
        confirmedOrders: orderStats[0].confirmed_orders || 0,
        deliveredOrders: orderStats[0].delivered_orders || 0,
        totalRevenue: orderStats[0].total_revenue || 0,
        deliveredRevenue: orderStats[0].delivered_revenue || 0,
        totalProducts: productStats[0].total_products || 0,
        totalStock: productStats[0].total_stock || 0,
        outOfStock: productStats[0].out_of_stock || 0,
        featuredProducts: productStats[0].featured_products || 0,
        totalUsers: userStats[0].total_users || 0,
        newUsers30Days: userStats[0].new_users_30days || 0,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let query = `
      SELECT 
        u.*,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
    `;

    const params = [];

    if (search) {
      query +=
        " WHERE u.name LIKE ? OR u.phone_number LIKE ? OR u.email LIKE ?";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [users] = await pool.query(query, params);

    // Get total count
    const countQuery = search
      ? "SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR phone_number LIKE ? OR email LIKE ?"
      : "SELECT COUNT(*) as total FROM users";
    const countParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`]
      : [];
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin - super_admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await pool.query(
      "SELECT name, phone_number FROM users WHERE id = ?",
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has orders
    const [orders] = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
      [id],
    );

    if (orders[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. User has ${orders[0].count} order(s). Consider deactivating instead.`,
      });
    }

    // Delete user
    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        req.admin.id,
        "delete",
        "user",
        id,
        `Deleted user: ${users[0].name} (${users[0].phone_number})`,
      ],
    );

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
