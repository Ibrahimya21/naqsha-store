import pool from "../config/db.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { generateResetToken, getResetTokenExpiryDate } from "../utils/token.js";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, agree_to_terms } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "صيغة البريد الإلكتروني غير صحيحة",
      });
    }

    if (!agree_to_terms) {
      return res.status(400).json({
        success: false,
        message: "يجب الموافقة على الشروط وسياسة الخصوصية",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "البريد الإلكتروني مستخدم بالفعل",
      });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password)
       VALUES (?, ?, ?)`,
      [full_name.trim(), normalizedEmail, hashedPassword],
    );

    const token = signToken({
      id: result.insertId,
      email: normalizedEmail,
      role: "user",
    });

    return res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      data: {
        token,
        user: {
          id: result.insertId,
          full_name: full_name.trim(),
          email: normalizedEmail,
          role: "user",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني وكلمة المرور مطلوبان",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      `SELECT id, full_name, email, password, role, is_active
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "هذا الحساب غير مفعل",
      });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const genericMessage =
      "إذا كان البريد مسجلًا لدينا، سيتم إرسال تعليمات استعادة كلمة السر.";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني مطلوب",
      });
    }

    const [users] = await pool.query(
      `
      SELECT id, email, full_name
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const user = users[0];

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `
      DELETE FROM password_reset_tokens
      WHERE user_id = ?
      `,
      [user.id],
    );

    await pool.query(
      `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
      `,
      [user.id, hashedToken, expiresAt],
    );

    const frontendUrl =
      process.env.FRONTEND_URL || "http://127.0.0.1:5500/frontEnd/pages";

    const resetLink = `${frontendUrl}/reset-password.html?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "إعادة تعيين كلمة السر - نقشة",
      text: `مرحبًا ${user.full_name || ""}

لقد طلبت إعادة تعيين كلمة السر لحسابك في نقشة.

افتح الرابط التالي لإعادة تعيين كلمة السر:
${resetLink}

ينتهي الرابط خلال 15 دقيقة.

إذا لم تطلب ذلك، تجاهل هذه الرسالة.`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #14322f;">
          <h2>إعادة تعيين كلمة السر</h2>
          <p>مرحبًا ${user.full_name || ""}</p>
          <p>لقد طلبت إعادة تعيين كلمة السر لحسابك في <strong>نقشة</strong>.</p>
          <p>
            <a
              href="${resetLink}"
              style="display:inline-block;background:#0f4f49;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:bold;"
            >
              إعادة تعيين كلمة السر
            </a>
          </p>
          <p>ينتهي هذا الرابط خلال 15 دقيقة.</p>
          <p>إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "التوكن وكلمة السر الجديدة مطلوبة",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة السر يجب أن تكون 6 أحرف على الأقل",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [tokens] = await pool.query(
      `
      SELECT id, user_id, expires_at, used_at
      FROM password_reset_tokens
      WHERE token = ?
      LIMIT 1
      `,
      [hashedToken],
    );

    if (!tokens.length) {
      return res.status(400).json({
        success: false,
        message: "رابط الاستعادة غير صالح",
      });
    }

    const resetToken = tokens[0];

    if (resetToken.used_at) {
      return res.status(400).json({
        success: false,
        message: "تم استخدام رابط الاستعادة مسبقًا",
      });
    }

    if (new Date(resetToken.expires_at).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "انتهت صلاحية رابط الاستعادة",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, resetToken.user_id],
    );

    await pool.query(
      `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ?
      `,
      [resetToken.id],
    );

    return res.status(200).json({
      success: true,
      message: "تم تغيير كلمة السر بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
