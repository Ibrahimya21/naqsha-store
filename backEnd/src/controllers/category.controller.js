import pool from "../config/db.js";
import { slugify } from "../utils/slug.js";

export const createCategory = async (req, res, next) => {
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
      "INSERT INTO categories (name, slug) VALUES (?, ?)",
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

export const getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, slug, created_at FROM categories ORDER BY id DESC",
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};
