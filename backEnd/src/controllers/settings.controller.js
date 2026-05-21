import pool from "../config/db.js";

export const getStoreSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM store_settings
       LIMIT 1`,
    );

    return res.status(200).json({
      success: true,
      data: rows[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStoreSettings = async (req, res, next) => {
  try {
    const {
      store_name,
      store_email,
      store_phone,
      store_address,
      currency,
      shipping_fee,
      bank_beneficiary_name,
      bank_name,
      bank_iban,
      jawwal_pay_number,
      palpay_number,
      logo_url,
    } = req.body;

    const [rows] = await pool.query(`SELECT id FROM store_settings LIMIT 1`);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "إعدادات المتجر غير موجودة",
      });
    }

    const settingsId = rows[0].id;

    await pool.query(
      `UPDATE store_settings
       SET
         store_name = COALESCE(?, store_name),
         store_email = COALESCE(?, store_email),
         store_phone = COALESCE(?, store_phone),
         store_address = COALESCE(?, store_address),
         currency = COALESCE(?, currency),
         shipping_fee = COALESCE(?, shipping_fee),
         bank_beneficiary_name = COALESCE(?, bank_beneficiary_name),
         bank_name = COALESCE(?, bank_name),
         bank_iban = COALESCE(?, bank_iban),
         jawwal_pay_number = COALESCE(?, jawwal_pay_number),
         palpay_number = COALESCE(?, palpay_number),
         logo_url = COALESCE(?, logo_url)
       WHERE id = ?`,
      [
        store_name ?? null,
        store_email ?? null,
        store_phone ?? null,
        store_address ?? null,
        currency ?? null,
        shipping_fee ?? null,
        bank_beneficiary_name ?? null,
        bank_name ?? null,
        bank_iban ?? null,
        jawwal_pay_number ?? null,
        palpay_number ?? null,
        logo_url ?? null,
        settingsId,
      ],
    );

    return res.status(200).json({
      success: true,
      message: "تم تحديث إعدادات المتجر بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
