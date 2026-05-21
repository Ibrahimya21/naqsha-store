import pool from "../config/db.js";

const SHIPPING_FEE = 15;
const ALLOWED_PAYMENT_METHODS = ["bank_transfer", "jawwal_pay", "palpay"];

const getUserId = (req) => req.user?.id || req.user?.user_id;

export const checkout = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = getUserId(req);

    if (!userId) {
      await connection.rollback();
      return res.status(401).json({
        success: false,
        message: "يجب تسجيل الدخول لإتمام الطلب",
      });
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      city,
      address_line,
      shipping_notes,
      payment_method,
      paid_amount,
      payer_name,
      reference_number,
      payment_notes,
    } = req.body || {};

    if (!customer_name || !customer_email || !customer_phone || !city || !address_line) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "بيانات الشحن غير مكتملة",
      });
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(payment_method)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "طريقة الدفع غير صحيحة",
      });
    }

    if (!paid_amount || !payer_name || !reference_number) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "بيانات الدفع غير مكتملة",
      });
    }

    const receiptImageUrl = req.file ? `/uploads/payments/${req.file.filename}` : null;

    if (!receiptImageUrl) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "يجب إرفاق إيصال الدفع",
      });
    }

    const [cartItems] = await connection.query(
      `SELECT
        ci.id AS cart_item_id,
        ci.quantity,
        pv.id AS product_variant_id,
        pv.product_id,
        pv.size,
        pv.color,
        COALESCE(pv.price, p.base_price) AS unit_price,
        p.name AS product_name,
        COALESCE(variant_image.image_url, main_image.image_url, p.main_image) AS product_image
      FROM cart_items ci
      INNER JOIN product_variants pv ON pv.id = ci.product_variant_id
      INNER JOIN products p ON p.id = pv.product_id
      LEFT JOIN product_images variant_image
        ON variant_image.product_variant_id = pv.id
      LEFT JOIN product_images main_image
        ON main_image.product_id = p.id AND main_image.is_main = 1
      WHERE ci.user_id = ?`,
      [userId],
    );

    if (!cartItems.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "السلة فارغة",
      });
    }

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + Number(item.unit_price || 0) * Number(item.quantity || 1);
    }, 0);

    const shippingFee = SHIPPING_FEE;
    const totalAmount = subtotal + shippingFee;
    const paidAmountNumber = Number(paid_amount);

    if (Number.isNaN(paidAmountNumber) || paidAmountNumber <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "المبلغ المدفوع يجب أن يكون رقمًا صحيحًا أكبر من صفر",
      });
    }

    const orderNumber = `NQ-${Date.now()}`;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        city,
        address_line,
        notes,
        payment_method,
        status,
        subtotal,
        shipping_fee,
        total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        customer_name,
        customer_email,
        customer_phone,
        city,
        address_line,
        shipping_notes || "",
        payment_method,
        "pending",
        subtotal,
        shippingFee,
        totalAmount,
      ],
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unit_price || 0);
      const lineTotal = quantity * unitPrice;

      const [stockResult] = await connection.query(
        `UPDATE product_variants
         SET stock = stock - ?
         WHERE id = ? AND stock >= ?`,
        [quantity, item.product_variant_id, quantity],
      );

      if (stockResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `المخزون غير كافٍ للمنتج: ${item.product_name}`,
        });
      }

      await connection.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          product_variant_id,
          product_name,
          product_image,
          size,
          color,
          quantity,
          unit_price,
          line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_variant_id,
          item.product_name,
          item.product_image,
          item.size,
          item.color,
          quantity,
          unitPrice,
          lineTotal,
        ],
      );
    }

    await connection.query(
      `INSERT INTO payments (
        order_id,
        provider,
        amount,
        reference_number,
        payer_name,
        payer_phone,
        receipt_image_url,
        notes,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        payment_method,
        paidAmountNumber,
        reference_number,
        payer_name,
        customer_phone,
        receiptImageUrl,
        payment_notes || "",
        "pending",
      ],
    );

    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      data: {
        order_id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        receipt_image_url: receiptImageUrl,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const [orders] = await pool.query(
      `SELECT
        id,
        order_number,
        status,
        payment_method,
        subtotal,
        shipping_fee,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        city,
        address_line,
        notes,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY id DESC`,
      [userId],
    );

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrderById = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { orderId } = req.params;

    const [orders] = await pool.query(
      `SELECT
        id,
        order_number,
        status,
        payment_method,
        subtotal,
        shipping_fee,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        city,
        address_line,
        notes,
        created_at
      FROM orders
      WHERE id = ? AND user_id = ?
      LIMIT 1`,
      [orderId, userId],
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    const [items] = await pool.query(
      `SELECT
        id,
        product_id,
        product_variant_id,
        product_name,
        product_image,
        size,
        color,
        unit_price,
        quantity,
        line_total
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC`,
      [orderId],
    );

    return res.status(200).json({
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
