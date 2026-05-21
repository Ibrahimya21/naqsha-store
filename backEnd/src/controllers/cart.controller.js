import pool from "../config/db.js";

export const getCart = async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT
        ci.id,
        ci.quantity,
        pv.id AS variant_id,
        pv.size,
        pv.color,
        pv.stock,
        COALESCE(pv.price, p.base_price) AS unit_price,
        p.id AS product_id,
        p.name AS product_name,
        p.slug AS product_slug,
        COALESCE(variant_image.image_url, main_image.image_url, p.main_image) AS product_image,
        p.main_image
      FROM cart_items ci
      INNER JOIN product_variants pv ON pv.id = ci.product_variant_id
      INNER JOIN products p ON p.id = pv.product_id
      LEFT JOIN product_images variant_image
        ON variant_image.product_variant_id = pv.id
      LEFT JOIN product_images main_image
        ON main_image.product_id = p.id AND main_image.is_main = 1
      WHERE ci.user_id = ?
      ORDER BY ci.id DESC`,
      [req.user.id],
    );

    const total = items.reduce((sum, item) => {
      return sum + Number(item.unit_price) * Number(item.quantity);
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { product_variant_id, quantity } = req.body;

    if (!product_variant_id) {
      return res.status(400).json({
        success: false,
        message: "product_variant_id مطلوب",
      });
    }

    const qty = Number(quantity || 1);

    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: "الكمية يجب أن تكون 1 أو أكثر",
      });
    }

    const [variants] = await pool.query(
      `SELECT id, stock
       FROM product_variants
       WHERE id = ?
       LIMIT 1`,
      [product_variant_id],
    );

    if (variants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "النسخة المطلوبة من المنتج غير موجودة",
      });
    }

    const variant = variants[0];

    if (variant.stock < qty) {
      return res.status(400).json({
        success: false,
        message: "الكمية المطلوبة غير متوفرة في المخزون",
      });
    }

    const [existing] = await pool.query(
      `SELECT id, quantity
       FROM cart_items
       WHERE user_id = ? AND product_variant_id = ?
       LIMIT 1`,
      [req.user.id, product_variant_id],
    );

    if (existing.length > 0) {
      const newQuantity = Number(existing[0].quantity) + qty;

      if (variant.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: "الكمية الإجمالية المطلوبة تتجاوز المخزون",
        });
      }

      await pool.query(
        `UPDATE cart_items
         SET quantity = ?
         WHERE id = ?`,
        [newQuantity, existing[0].id],
      );

      return res.status(200).json({
        success: true,
        message: "تم تحديث كمية المنتج في السلة",
      });
    }

    await pool.query(
      `INSERT INTO cart_items (user_id, product_variant_id, quantity)
       VALUES (?, ?, ?)`,
      [req.user.id, product_variant_id, qty],
    );

    return res.status(201).json({
      success: true,
      message: "تمت إضافة المنتج إلى السلة",
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);

    if (!qty || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "الكمية يجب أن تكون 1 أو أكثر",
      });
    }

    const [items] = await pool.query(
      `SELECT ci.id, ci.product_variant_id, pv.stock
       FROM cart_items ci
       INNER JOIN product_variants pv ON pv.id = ci.product_variant_id
       WHERE ci.id = ? AND ci.user_id = ?
       LIMIT 1`,
      [itemId, req.user.id],
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "عنصر السلة غير موجود",
      });
    }

    if (qty > Number(items[0].stock)) {
      return res.status(400).json({
        success: false,
        message: "الكمية المطلوبة غير متوفرة في المخزون",
      });
    }

    await pool.query(
      `UPDATE cart_items
       SET quantity = ?
       WHERE id = ?`,
      [qty, itemId],
    );

    return res.status(200).json({
      success: true,
      message: "تم تحديث العنصر في السلة",
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const [result] = await pool.query(
      `DELETE FROM cart_items
       WHERE id = ? AND user_id = ?`,
      [itemId, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "العنصر غير موجود في السلة",
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم حذف العنصر من السلة",
    });
  } catch (error) {
    next(error);
  }
};
