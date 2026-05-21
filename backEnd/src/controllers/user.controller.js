import pool from "../config/db.js";
import bcrypt from "bcryptjs";


export const getAllUsersForAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT
        id,
        full_name,
        email,
        role,
        is_active,
        created_at
      FROM users
      ORDER BY id DESC`,
    );

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdForAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.query(
      `SELECT
        id,
        full_name,
        email,
        role,
        is_active,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    const [orders] = await pool.query(
      `SELECT
        id,
        order_number,
        status,
        payment_method,
        total_amount,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY id DESC`,
      [userId],
    );

    return res.status(200).json({
      success: true,
      data: {
        ...users[0],
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleForAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "الدور يجب أن يكون user أو admin",
      });
    }

    const [users] = await pool.query(
      `SELECT id FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    await pool.query(
      `UPDATE users
       SET role = ?
       WHERE id = ?`,
      [role, userId],
    );

    return res.status(200).json({
      success: true,
      message: "تم تحديث دور المستخدم بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatusForAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.query(
      `SELECT id, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    const newStatus = !Boolean(users[0].is_active);

    await pool.query(
      `UPDATE users
       SET is_active = ?
       WHERE id = ?`,
      [newStatus, userId],
    );

    return res.status(200).json({
      success: true,
      message: newStatus ? "تم تفعيل المستخدم" : "تم تعطيل المستخدم",
      data: {
        is_active: newStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح",
      });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "كلمة السر الحالية والجديدة مطلوبة",
      });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل",
      });
    }

    const [users] = await pool.query(
      `
      SELECT id, password
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "كلمة السر الحالية غير صحيحة",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, userId],
    );

    return res.status(200).json({
      success: true,
      message: "تم تغيير كلمة السر بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
