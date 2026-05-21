import pool from "../config/db.js";

const ALLOWED_PROVIDERS = ["bank_transfer", "jawwal_pay", "palpay"];

export const submitPaymentProof = async (req, res, next) => {
  try {
    const {
      order_id,
      provider,
      reference_number,
      payer_name,
      payer_phone,
      receipt_image_url,
      notes,
    } = req.body;

    if (!order_id || !provider || !reference_number || !payer_name) {
      return res.status(400).json({
        success: false,
        message: "order_id و provider و reference_number و payer_name مطلوبة",
      });
    }

    if (!ALLOWED_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "طريقة الدفع غير مدعومة",
      });
    }

    const [orders] = await pool.query(
      `SELECT id, payment_method, total_amount, status
       FROM orders
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [order_id, req.user.id],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    const order = orders[0];

    if (order.payment_method !== provider) {
      return res.status(400).json({
        success: false,
        message: "طريقة الدفع لا تطابق الطريقة المختارة في الطلب",
      });
    }

    const [payments] = await pool.query(
      `SELECT id
       FROM payments
       WHERE order_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [order_id],
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "سجل الدفع غير موجود",
      });
    }

    await pool.query(
      `UPDATE payments
       SET
         provider = ?,
         reference_number = ?,
         payer_name = ?,
         payer_phone = ?,
         receipt_image_url = ?,
         notes = ?,
         status = 'pending'
       WHERE id = ?`,
      [
        provider,
        reference_number.trim(),
        payer_name.trim(),
        payer_phone ? payer_phone.trim() : null,
        receipt_image_url ? receipt_image_url.trim() : null,
        notes || null,
        payments[0].id,
      ],
    );

    return res.status(200).json({
      success: true,
      message: "تم إرسال بيانات الدفع بنجاح، وسيتم مراجعتها",
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentInstructions = async (req, res, next) => {
  try {
    const { provider } = req.params;

    if (!ALLOWED_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "طريقة الدفع غير مدعومة",
      });
    }

    let data = null;

    if (provider === "bank_transfer") {
      data = {
        provider: "bank_transfer",
        title: "تحويل بنك فلسطين",
        details: {
          beneficiary_name: "نقشة",
          bank_name: "Bank of Palestine",
          iban: "PS00PALS000000000000000000000",
          note: "قم بالتحويل ثم أرسل رقم الحوالة أو صورة الإيصال",
        },
      };
    }

    if (provider === "jawwal_pay") {
      data = {
        provider: "jawwal_pay",
        title: "Jawwal Pay",
        details: {
          merchant_name: "نقشة",
          wallet_number: "0590000000",
          note: "قم بالدفع ثم أرسل رقم العملية أو صورة الإيصال",
        },
      };
    }

    if (provider === "palpay") {
      data = {
        provider: "palpay",
        title: "PalPay",
        details: {
          merchant_name: "نقشة",
          wallet_number: "0560000000",
          note: "قم بالدفع ثم أرسل رقم العملية أو صورة الإيصال",
        },
      };
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
