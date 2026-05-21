import pool from "../config/db.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [[productsCount]] = await pool.query(
      `SELECT COUNT(*) AS total_products FROM products`,
    );

    const [[usersCount]] = await pool.query(
      `SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'`,
    );

    const [[ordersCount]] = await pool.query(
      `SELECT COUNT(*) AS total_orders FROM orders`,
    );

    const [[pendingPaymentsCount]] = await pool.query(
      `SELECT COUNT(*) AS pending_payments
       FROM payments
       WHERE status = 'pending'`,
    );

    const [[salesTotal]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales
       FROM orders
       WHERE status IN ('paid', 'processing', 'shipped', 'completed')`,
    );

    const [latestOrders] = await pool.query(
      `SELECT
        id,
        order_number,
        customer_name,
        payment_method,
        status,
        total_amount,
        created_at
      FROM orders
      ORDER BY id DESC
      LIMIT 5`,
    );

    const [lowStockItems] = await pool.query(
      `SELECT
        pv.id,
        p.name AS product_name,
        pv.size,
        pv.color,
        pv.stock
      FROM product_variants pv
      INNER JOIN products p ON p.id = pv.product_id
      WHERE pv.stock <= 3
      ORDER BY pv.stock ASC, pv.id DESC
      LIMIT 10`,
    );

    return res.status(200).json({
      success: true,
      data: {
        total_products: productsCount.total_products,
        total_users: usersCount.total_users,
        total_orders: ordersCount.total_orders,
        pending_payments: pendingPaymentsCount.pending_payments,
        total_sales: salesTotal.total_sales,
        latest_orders: latestOrders,
        low_stock_items: lowStockItems,
      },
    });
  } catch (error) {
    next(error);
  }
};
