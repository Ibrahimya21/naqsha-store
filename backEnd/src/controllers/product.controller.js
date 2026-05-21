import pool from "../config/db.js";
import { slugify } from "../utils/slug.js";

const normalizeImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/uploads")) {
    return imagePath;
  }

  return `/uploads/${String(imagePath).replace(/^\/+/, "")}`;
};

export const createProduct = async (req, res, next) => {
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
        base_price,
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
            price || null,
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

export const getProducts = async (req, res, next) => {
  try {
    const { category, search, min_price, max_price, color, size } = req.query;

    let query = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.main_image,
        p.is_active,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.is_active = TRUE
    `;

    const values = [];

    if (category) {
      query += " AND c.slug = ? ";
      values.push(category);
    }

    if (search) {
      const keyword = `%${search.trim()}%`;
      query += `
        AND (
          p.name LIKE ?
          OR p.description LIKE ?
          OR p.slug LIKE ?
          OR c.name LIKE ?
          OR c.slug LIKE ?
        )
      `;
      values.push(keyword, keyword, keyword, keyword, keyword);
    }

    if (min_price) {
      query += " AND p.base_price >= ? ";
      values.push(Number(min_price));
    }

    if (max_price) {
      query += " AND p.base_price <= ? ";
      values.push(Number(max_price));
    }

    if (color) {
      query += " AND LOWER(pv.color) = ? ";
      values.push(color.trim().toLowerCase());
    }

    if (size) {
      query += " AND LOWER(pv.size) = ? ";
      values.push(size.trim().toLowerCase());
    }

    query += " ORDER BY p.id DESC";

    const [rows] = await pool.query(query, values);

    const normalizedRows = rows.map((row) => ({
      ...row,
      main_image: normalizeImageUrl(row.main_image),
    }));

    return res.status(200).json({
      success: true,
      data: normalizedRows,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsStats = async (req, res, next) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(DISTINCT p.id) AS total_products,
        COALESCE(SUM(pv.stock), 0) AS total_pieces
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.is_active = 1
    `);

    return res.status(200).json({
      success: true,
      data: {
        total_products: Number(stats.total_products || 0),
        total_pieces: Number(stats.total_pieces || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.main_image,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
      LIMIT 1`,
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    const [variants] = await pool.query(
      `SELECT id, size, color, stock, price, sku
       FROM product_variants
       WHERE product_id = ?
       ORDER BY id ASC`,
      [id],
    );

    const [images] = await pool.query(
      `SELECT
        pi.id,
        pi.image_url,
        pi.is_main,
        pi.sort_order,
        pi.product_variant_id,
        pv.color AS variant_color,
        pv.size AS variant_size
       FROM product_images pi
       LEFT JOIN product_variants pv ON pv.id = pi.product_variant_id
       WHERE pi.product_id = ?
       ORDER BY pi.sort_order ASC, pi.id ASC`,
      [id],
    );

    const availableColors = [...new Set(variants.map((v) => v.color))];
    const availableSizes = [...new Set(variants.map((v) => v.size))];

    const normalizedImages = images.map((img) => ({
      ...img,
      image_url: normalizeImageUrl(img.image_url),
    }));

    return res.status(200).json({
      success: true,
      data: {
        ...products[0],
        main_image: normalizeImageUrl(products[0].main_image),
        available_colors: availableColors,
        available_sizes: availableSizes,
        variants,
        images: normalizedImages,
      },
    });
  } catch (error) {
    next(error);
  }
};
