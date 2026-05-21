import pool from "../config/db.js";
import { slugify } from "../utils/slug.js";

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "rejected",
];

const ALLOWED_PAYMENT_REVIEW_STATUSES = ["approved", "rejected"];

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, payment_method } = req.query;

    let query = `
      SELECT
        o.id,
        o.order_number,
        o.status,
        o.payment_method,
        o.subtotal,
        o.shipping_fee,
        o.total_amount,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.city,
        o.address_line,
        o.notes,
        o.created_at,
        u.id AS user_id,
        u.full_name AS user_name,
        u.email AS user_email
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      WHERE 1 = 1
    `;

    const values = [];

    if (status) {
      query += " AND o.status = ? ";
      values.push(status);
    }

    if (payment_method) {
      query += " AND o.payment_method = ? ";
      values.push(payment_method);
    }

    query += " ORDER BY o.id DESC";

    const [orders] = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetailsForAdmin = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const [orders] = await pool.query(
      `SELECT
        o.id,
        o.order_number,
        o.status,
        o.payment_method,
        o.subtotal,
        o.shipping_fee,
        o.total_amount,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.city,
        o.address_line,
        o.notes,
        o.created_at,
        o.updated_at,
        u.id AS user_id,
        u.full_name AS user_name,
        u.email AS user_email
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      WHERE o.id = ?
      LIMIT 1`,
      [orderId],
    );

    if (orders.length === 0) {
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

    const [payments] = await pool.query(
      `SELECT
        id,
        provider,
        status,
        amount,
        reference_number,
        payer_name,
        payer_phone,
        receipt_image_url,
        notes,
        created_at,
        updated_at
      FROM payments
      WHERE order_id = ?
      ORDER BY id DESC`,
      [orderId],
    );

    return res.status(200).json({
      success: true,
      data: {
        ...orders[0],
        items,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reviewPayment = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { paymentId } = req.params;
    const { status, admin_note } = req.body;

    if (!status || !ALLOWED_PAYMENT_REVIEW_STATUSES.includes(status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "حالة مراجعة الدفع يجب أن تكون approved أو rejected",
      });
    }

    const [payments] = await connection.query(
      `SELECT id, order_id, status AS current_status
       FROM payments
       WHERE id = ?
       LIMIT 1`,
      [paymentId],
    );

    if (payments.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "سجل الدفع غير موجود",
      });
    }

      const payment = payments[0];
      const alreadyReviewed = ["approved", "rejected"].includes(payment.current_status);

      if (alreadyReviewed) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: payment.current_status === "approved"
            ? "تم قبول هذا الدفع مسبقًا ولا يمكن رفضه بعد القبول"
            : "تم رفض هذا الدفع مسبقًا ولا يمكن قبوله بعد الرفض",
        });
      }

    await connection.query(
      `UPDATE payments
       SET status = ?, notes = ?
       WHERE id = ?`,
      [status, admin_note || null, paymentId],
    );

    if (status === "approved") {
      await connection.query(
        `UPDATE orders
         SET status = 'paid'
         WHERE id = ?`,
        [payment.order_id],
      );

    }
    if (status === "rejected") {
      await connection.query(
        `UPDATE product_variants pv
         INNER JOIN order_items oi ON oi.product_variant_id = pv.id
         SET pv.stock = pv.stock + oi.quantity
         WHERE oi.order_id = ?`,
        [payment.order_id],
      );

      await connection.query(
        `UPDATE orders
         SET status = 'rejected'
         WHERE id = ?`,
        [payment.order_id],
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "تمت الموافقة على الدفع وتحديث الطلب"
          : "تم رفض الدفع",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "حالة الطلب غير صحيحة",
      });
    }

    const [orders] = await pool.query(
      `SELECT id, status
       FROM orders
       WHERE id = ?
       LIMIT 1`,
      [orderId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    await pool.query(
      `UPDATE orders
       SET status = ?
       WHERE id = ?`,
      [status, orderId],
    );

    return res.status(200).json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export const createCategoryByAdmin = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "اسم التصنيف مطلوب",
      });
    }

    const slug = slugify(name);

    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      [slug],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "التصنيف موجود بالفعل",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO categories (name, slug)
       VALUES (?, ?)`,
      [name.trim(), slug],
    );

    return res.status(201).json({
      success: true,
      message: "تم إنشاء التصنيف بنجاح",
      data: {
        id: result.insertId,
        name: name.trim(),
        slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryByAdmin = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "اسم التصنيف مطلوب",
      });
    }

    const [categories] = await pool.query(
      "SELECT id FROM categories WHERE id = ? LIMIT 1",
      [categoryId],
    );

    if (!categories.length) {
      return res.status(404).json({
        success: false,
        message: "التصنيف غير موجود",
      });
    }

    const slug = slugify(name);

    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1",
      [slug, categoryId],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "يوجد تصنيف آخر بنفس الاسم",
      });
    }

    await pool.query(
      `UPDATE categories
       SET name = ?, slug = ?
       WHERE id = ?`,
      [name.trim(), slug, categoryId],
    );

    return res.status(200).json({
      success: true,
      message: "تم تعديل التصنيف بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryByAdmin = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const [categories] = await pool.query(
      "SELECT id FROM categories WHERE id = ? LIMIT 1",
      [categoryId],
    );

    if (!categories.length) {
      return res.status(404).json({
        success: false,
        message: "التصنيف غير موجود",
      });
    }

    const [linkedProducts] = await pool.query(
      "SELECT id FROM products WHERE category_id = ? LIMIT 1",
      [categoryId],
    );

    if (linkedProducts.length) {
      return res.status(409).json({
        success: false,
        message: "لا يمكن حذف التصنيف لأنه مربوط بمنتجات. انقل المنتجات لتصنيف آخر أو احذفها أولًا.",
      });
    }

    await pool.query("DELETE FROM categories WHERE id = ?", [categoryId]);

    return res.status(200).json({
      success: true,
      message: "تم حذف التصنيف بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export const createProductByAdmin = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      category_id,
      name,
      description,
      base_price,
      main_image,
      variants,
      images,
    } = req.body;

    if (!category_id || !name || !base_price) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "category_id و name و base_price مطلوبة",
      });
    }

    const [categories] = await connection.query(
      "SELECT id FROM categories WHERE id = ? LIMIT 1",
      [category_id],
    );

    if (categories.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "التصنيف غير موجود",
      });
    }

    const slug = slugify(name);

    const [existing] = await connection.query(
      "SELECT id FROM products WHERE slug = ? LIMIT 1",
      [slug],
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "المنتج موجود بالفعل",
      });
    }

    const [productResult] = await connection.query(
      `INSERT INTO products
       (category_id, name, slug, description, base_price, main_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name.trim(),
        slug,
        description || null,
        Number(base_price),
        main_image || null,
      ],
    );

    const productId = productResult.insertId;
    const createdVariants = [];

    if (Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        const { size, color, stock, price, sku } = variant;

        if (!size || !color) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: "كل variant يجب أن يحتوي على size و color",
          });
        }

        const [variantResult] = await connection.query(
          `INSERT INTO product_variants
           (product_id, size, color, stock, price, sku)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            productId,
            size.trim(),
            color.trim(),
            Number(stock || 0),
            price ? Number(price) : null,
            sku || null,
          ],
        );

        createdVariants.push({
          id: variantResult.insertId,
          size: size.trim(),
          color: color.trim(),
        });
      }
    }

    if (Array.isArray(images) && images.length > 0) {
      for (const image of images) {
        const {
          image_url,
          is_main = false,
          sort_order = 0,
          variant_color = null,
          variant_size = null,
        } = image;

        if (!image_url) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: "كل صورة يجب أن تحتوي على image_url",
          });
        }

        let matchedVariantId = null;

        if (variant_color || variant_size) {
          const matchedVariant = createdVariants.find((v) => {
            const sameColor = variant_color
              ? v.color.toLowerCase() ===
                String(variant_color).trim().toLowerCase()
              : true;

            const sameSize = variant_size
              ? v.size.toLowerCase() ===
                String(variant_size).trim().toLowerCase()
              : true;

            return sameColor && sameSize;
          });

          if (!matchedVariant) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              message: "الصورة مرتبطة بـ variant غير موجود",
            });
          }

          matchedVariantId = matchedVariant.id;
        }

        await connection.query(
          `INSERT INTO product_images
           (product_id, product_variant_id, image_url, is_main, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [
            productId,
            matchedVariantId,
            image_url,
            Boolean(is_main),
            Number(sort_order || 0),
          ],
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "تم إنشاء المنتج بنجاح",
      data: {
        id: productId,
        slug,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const updateProductByAdmin = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { productId } = req.params;
    const {
      category_id,
      name,
      description,
      base_price,
      main_image,
      is_active,
      variants,
      images,
    } = req.body;

    const [products] = await connection.query(
      `SELECT id, name
       FROM products
       WHERE id = ?
       LIMIT 1`,
      [productId],
    );

    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    if (category_id) {
      const [categories] = await connection.query(
        "SELECT id FROM categories WHERE id = ? LIMIT 1",
        [category_id],
      );

      if (categories.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "التصنيف غير موجود",
        });
      }
    }

    let updatedSlug = null;

    if (name && name.trim()) {
      updatedSlug = slugify(name);

      const [existing] = await connection.query(
        "SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1",
        [updatedSlug, productId],
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: "يوجد منتج آخر بنفس الاسم",
        });
      }
    }

    await connection.query(
      `UPDATE products
       SET
         category_id = COALESCE(?, category_id),
         name = COALESCE(?, name),
         slug = COALESCE(?, slug),
         description = COALESCE(?, description),
         base_price = COALESCE(?, base_price),
         main_image = COALESCE(?, main_image),
         is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        category_id ?? null,
        name?.trim() ?? null,
        updatedSlug,
        description ?? null,
        base_price ?? null,
        main_image ?? null,
        typeof is_active === "boolean" ? is_active : null,
        productId,
      ],
    );

    const savedVariants = [];

    if (Array.isArray(variants)) {
      const [existingVariantsBeforeUpdate] = await connection.query(
        `SELECT id FROM product_variants WHERE product_id = ?`,
        [productId],
      );
      const existingVariantIds = existingVariantsBeforeUpdate.map((variant) => Number(variant.id));
      const incomingIds = variants
        .map((variant) => Number(variant.id || 0))
        .filter((id) => id > 0);

      for (const variant of variants) {
        const { id, size, color, stock, price, sku } = variant;

        if (!size || !color) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: "كل variant يجب أن يحتوي على size و color",
          });
        }

        const cleanSize = size.trim();
        const cleanColor = color.trim();
        const cleanPrice = price ? Number(price) : null;
        const cleanSku = sku || null;

        if (id) {
          const [ownedVariants] = await connection.query(
            `SELECT id
             FROM product_variants
             WHERE id = ? AND product_id = ?
             LIMIT 1`,
            [id, productId],
          );

          if (!ownedVariants.length) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              message: "يوجد متغير لا يتبع هذا المنتج",
            });
          }

          await connection.query(
            `UPDATE product_variants
             SET size = ?, color = ?, stock = ?, price = ?, sku = ?
             WHERE id = ? AND product_id = ?`,
            [cleanSize, cleanColor, Number(stock || 0), cleanPrice, cleanSku, id, productId],
          );

          savedVariants.push({ id: Number(id), size: cleanSize, color: cleanColor });
        } else {
          const [variantResult] = await connection.query(
            `INSERT INTO product_variants
             (product_id, size, color, stock, price, sku)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [productId, cleanSize, cleanColor, Number(stock || 0), cleanPrice, cleanSku],
          );

          savedVariants.push({ id: variantResult.insertId, size: cleanSize, color: cleanColor });
        }
      }

      const deleteIds = existingVariantIds.filter((id) => !incomingIds.includes(id));

      if (deleteIds.length) {
        const deletePlaceholders = deleteIds.map(() => "?").join(",");

        const [[usage]] = await connection.query(
          `SELECT
            (SELECT COUNT(*) FROM order_items WHERE product_variant_id IN (${deletePlaceholders})) AS orders_count,
            (SELECT COUNT(*) FROM cart_items WHERE product_variant_id IN (${deletePlaceholders})) AS cart_count`,
          [...deleteIds, ...deleteIds],
        );

        if (Number(usage.orders_count || 0) > 0 || Number(usage.cart_count || 0) > 0) {
          await connection.rollback();
          return res.status(409).json({
            success: false,
            message: "لا يمكن حذف متغير مرتبط بطلبات أو سلال. عدّل بياناته أو صفّر مخزونه بدل حذفه.",
          });
        }

        await connection.query(
          `DELETE FROM product_images WHERE product_variant_id IN (${deletePlaceholders})`,
          deleteIds,
        );
        await connection.query(
          `DELETE FROM product_variants WHERE product_id = ? AND id IN (${deletePlaceholders})`,
          [productId, ...deleteIds],
        );
      }
    }


    if (Array.isArray(images)) {
      await connection.query(`DELETE FROM product_images WHERE product_id = ?`, [productId]);

      const [currentVariants] = await connection.query(
        `SELECT id, size, color
         FROM product_variants
         WHERE product_id = ?`,
        [productId],
      );

      const variantsForImages = savedVariants.length ? savedVariants : currentVariants;

      for (const image of images) {
        const {
          image_url,
          is_main = false,
          sort_order = 0,
          variant_color = null,
          variant_size = null,
        } = image;

        if (!image_url) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: "كل صورة يجب أن تحتوي على image_url",
          });
        }

        let matchedVariantId = null;

        if (variant_color || variant_size) {
          const matchedVariant = variantsForImages.find((v) => {
            const sameColor = variant_color
              ? v.color.toLowerCase() === String(variant_color).trim().toLowerCase()
              : true;

            const sameSize = variant_size
              ? v.size.toLowerCase() === String(variant_size).trim().toLowerCase()
              : true;

            return sameColor && sameSize;
          });

          if (!matchedVariant) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              message: "الصورة مرتبطة بمتغير غير موجود بعد التحديث",
            });
          }

          matchedVariantId = matchedVariant.id;
        }

        await connection.query(
          `INSERT INTO product_images
           (product_id, product_variant_id, image_url, is_main, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, matchedVariantId, image_url, Boolean(is_main), Number(sort_order || 0)],
        );
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "تم تحديث المنتج بنجاح",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const toggleProductStatusByAdmin = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.params.id;


    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "رقم المنتج مطلوب",
      });
    }

    const [products] = await pool.query(
      `
      SELECT id, is_active
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [productId],
    );


    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    const currentStatus = Number(products[0].is_active);
    const nextStatus = currentStatus === 1 ? 0 : 1;

    const [updateResult] = await pool.query(
      `
      UPDATE products
      SET is_active = ?
      WHERE id = ?
      `,
      [nextStatus, productId],
    );


    return res.status(200).json({
      success: true,
      message: nextStatus ? "تم تفعيل المنتج" : "تم تعطيل المنتج",
      data: {
        id: Number(productId),
        old_status: currentStatus,
        is_active: nextStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const deleteProductByAdmin = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productId = req.params.productId || req.params.id;

    if (!productId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "رقم المنتج مطلوب",
      });
    }

    const [products] = await connection.query(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [productId],
    );

    if (!products.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    const [[usage]] = await connection.query(
      `
      SELECT
        (SELECT COUNT(*) FROM order_items WHERE product_id = ?) AS orders_count,
        (
          SELECT COUNT(*)
          FROM cart_items ci
          INNER JOIN product_variants pv ON pv.id = ci.product_variant_id
          WHERE pv.product_id = ?
        ) AS cart_count
      `,
      [productId, productId],
    );

    const ordersCount = Number(usage?.orders_count || 0);
    const cartCount = Number(usage?.cart_count || 0);

    if (ordersCount > 0 || cartCount > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: `هذا المنتج مربوط بـ ${ordersCount} عنصر داخل طلبات و ${cartCount} عنصر داخل سلال مستخدمين، لذلك لا يمكن حذفه. يمكنك تعطيله بدل الحذف.`,
        data: {
          orders_count: ordersCount,
          cart_count: cartCount,
        },
      });
    }

    await connection.query(
      `
      DELETE FROM product_images
      WHERE product_id = ?
      `,
      [productId],
    );

    await connection.query(
      `
      DELETE FROM product_variants
      WHERE product_id = ?
      `,
      [productId],
    );

    await connection.query(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [productId],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const getAllProductsForAdmin = async (req, res, next) => {
  try {
    const [products] = await pool.query(`
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.main_image,
        p.is_active,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(SUM(pv.stock), 0) AS total_stock,
        COUNT(pv.id) AS variants_count,
        COALESCE(order_refs.count, 0) AS order_items_count,
        COALESCE(cart_refs.count, 0) AS cart_items_count,
        CASE
          WHEN COALESCE(order_refs.count, 0) > 0 OR COALESCE(cart_refs.count, 0) > 0 THEN 0
          ELSE 1
        END AS can_delete
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      LEFT JOIN (
        SELECT product_id, COUNT(*) AS count
        FROM order_items
        GROUP BY product_id
      ) AS order_refs ON order_refs.product_id = p.id
      LEFT JOIN (
        SELECT pv.product_id, COUNT(*) AS count
        FROM cart_items ci
        INNER JOIN product_variants pv ON pv.id = ci.product_variant_id
        GROUP BY pv.product_id
      ) AS cart_refs ON cart_refs.product_id = p.id
      GROUP BY
        p.id,
        p.category_id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.main_image,
        p.is_active,
        c.name,
        c.slug,
        order_refs.count,
        cart_refs.count
      ORDER BY p.id DESC
    `);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
