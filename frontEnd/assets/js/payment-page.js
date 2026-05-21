import { getCart } from "./api/cart-api.js";
import { checkoutOrder } from "./api/orders-api.js";
import { resolveImageUrl } from "./utils/image.js";

const PAYMENT_METHODS = {
  bank_transfer: {
    title: "بيانات التحويل البنكي",
    desc: "يرجى استخدام البيانات التالية عند تنفيذ الحوالة البنكية.",
    providerLabel: "اسم البنك",
    providerValue: "بنك فلسطين",
    referencePlaceholder: "أدخل الرقم المرجعي للحوالة البنكية",
    accountNameLabel: "اسم صاحب الحساب",
    accountNamePlaceholder: "الاسم الكامل كما يظهر في التحويل",
    receiptHelp: "أرفق صورة أو ملف إيصال الحوالة البنكية.",
    info: [
      {
        label: "رقم الحساب",
        value: "286695",
        dir: "ltr",
      },
      {
        label: "رقم الآيبان",
        value: "PS40 PALS 0446 0286 6950 9931 00000",
        dir: "ltr",
      },
      {
        label: "اسم المستفيد",
        value: "ابراهيم عوض",
      },
      {
        label: "رقم البنك",
        value:  "0567981045",
        dir: "ltr",
      },
    ],
  },

  jawwal_pay: {
    title: "بيانات محفظة Jawwal Pay",
    desc: "حوّل المبلغ إلى رقم المحفظة التالي ثم أدخل رقم العملية وارفع الإيصال.",
    providerLabel: "اسم المحفظة",
    providerValue: "Jawwal Pay",
    referencePlaceholder: "أدخل رقم عملية Jawwal Pay",
    accountNameLabel: "اسم صاحب المحفظة",
    accountNamePlaceholder: "الاسم الظاهر في محفظة Jawwal Pay",
    receiptHelp: "أرفق لقطة شاشة من عملية الدفع عبر Jawwal Pay.",
    info: [
      {
        label: "رقم المحفظة",
        value: "0592425733",
        dir: "ltr",
      },
      {
        label: "اسم المستفيد",
        value: "ابراهيم عوض",
      },
      {
        label: "طريقة الدفع",
        value: "Jawwal Pay",
      },
      {
        label: "ملاحظة",
        value: "اكتب رقم الطلب في ملاحظات التحويل",
      },
    ],
  },

  palpay: {
    title: "بيانات محفظة PalPay",
    desc: "حوّل المبلغ إلى رقم محفظة PalPay التالي ثم أدخل رقم العملية وارفع الإيصال.",
    providerLabel: "اسم المحفظة",
    providerValue: "PalPay",
    referencePlaceholder: "أدخل رقم عملية PalPay",
    accountNameLabel: "اسم صاحب المحفظة",
    accountNamePlaceholder: "الاسم الظاهر في محفظة PalPay",
    receiptHelp: "أرفق لقطة شاشة من عملية الدفع عبر PalPay.",
    info: [
      {
        label: "رقم المحفظة",
        value: "0592425733",
        dir: "ltr",
      },
      {
        label: "اسم المستفيد",
        value: "ابراهيم عوض",
      },
      {
        label: "طريقة الدفع",
        value: "PalPay",
      },
      {
        label: "ملاحظة",
        value: "اكتب رقم الطلب في ملاحظات التحويل",
      },
    ],
  },
};

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadPaymentSummary();
  bindPaymentMethods();
  bindFilePreview();
  bindPaymentForm();

  updatePaymentMethod("bank_transfer");
});

async function loadPaymentSummary() {
  try {
    const response = await getCart();
    const cart = response.data || {};
    const items = cart.items || cart.cart_items || [];

    renderCheckoutItems(items);
    renderCheckoutTotals(items, cart);
  } catch (error) {
    console.error("Payment summary error:", error);
  }
}

function bindPaymentMethods() {
  document.querySelectorAll("[data-payment-method]").forEach((button) => {
    button.addEventListener("click", () => {
      const method = button.dataset.paymentMethod;
      updatePaymentMethod(method);
    });
  });
}

function updatePaymentMethod(method) {
  const config = PAYMENT_METHODS[method] || PAYMENT_METHODS.bank_transfer;

  document.querySelectorAll("[data-payment-method]").forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.paymentMethod === method,
    );
  });

  setValue("payment-method", method);

  setText("[data-payment-info-title]", config.title);
  setText("[data-payment-info-desc]", config.desc);
  setText("[data-payment-info-badge]", config.providerValue);

  const grid = document.querySelector("[data-payment-info-grid]");

  if (grid) {
    grid.innerHTML = config.info
      .map(
        (item) => `
          <div class="payment-info-item">
            <span>${escapeHtml(item.label)}</span>
            <strong ${item.dir ? `dir="${item.dir}"` : ""}>
              ${escapeHtml(item.value)}
            </strong>
          </div>
        `,
      )
      .join("");
  }

  const providerLabel = document.querySelector("[data-provider-label]");
  if (providerLabel) providerLabel.textContent = config.providerLabel;

  setValue("payment-provider", config.providerValue);
  const providerInput = document.getElementById("payment-provider");
  if (providerInput) {
    providerInput.readOnly = true;
    providerInput.setAttribute("aria-readonly", "true");
    providerInput.classList.add("readonly-field");
  }

  const referenceInput = document.getElementById("reference-number");
  if (referenceInput) {
    referenceInput.placeholder = config.referencePlaceholder;
  }

  const accountNameLabel = document.querySelector('label[for="account-name"]');
  if (accountNameLabel) {
    accountNameLabel.textContent = config.accountNameLabel;
  }

  const accountNameInput = document.getElementById("account-name");
  if (accountNameInput) {
    accountNameInput.placeholder = config.accountNamePlaceholder;
  }

  const help = document.querySelector("[data-receipt-help]");
  if (help) {
    help.textContent = config.receiptHelp;
  }
}

function bindFilePreview() {
  const receiptInput = document.getElementById("receipt");
  const uploadText = document.querySelector("[data-upload-text]");

  if (!receiptInput || !uploadText) return;

  receiptInput.addEventListener("change", () => {
    const file = receiptInput.files?.[0];

    if (!file) {
      uploadText.textContent = "انقر لتحميل الملف أو اسحبه هنا";
      return;
    }

    uploadText.textContent = file.name;
  });
}

function bindPaymentForm() {
  const form = document.getElementById("payment-transfer-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const shippingData = getShippingData();

    if (!shippingData) {
      showWarning("بيانات الشحن غير موجودة، الرجاء الرجوع لصفحة الشحن.");
      window.location.href = "shipping.html";
      return;
    }

    const receiptInput = document.getElementById("receipt");
    const receiptFile = receiptInput?.files?.[0];

    if (!receiptFile) {
      showWarning("يرجى إرفاق إيصال الدفع.");
      return;
    }

    const formData = new FormData(form);

    formData.append(
      "customer_name",
      `${shippingData.firstName} ${shippingData.lastName}`,
    );
    formData.append("customer_email", shippingData.email);
    formData.append("customer_phone", shippingData.phone);
    formData.append("country", shippingData.country);
    formData.append("city", shippingData.city);
    formData.append("address_line", shippingData.address);
    formData.append("postal_code", shippingData.postalCode || "");
    formData.append("shipping_notes", shippingData.notes || "");

    formData.append("payment_method", formData.get("paymentMethod"));
    formData.append("payment_provider", formData.get("paymentProvider"));
    formData.append("paid_amount", formData.get("paidAmount"));
    formData.append("paid_date", formData.get("paidDate"));
    formData.append("currency", formData.get("currency"));
    formData.append("payer_name", formData.get("accountName"));
    formData.append("reference_number", formData.get("referenceNumber"));
    formData.append("payment_notes", formData.get("paymentNotes") || "");

    const submitButtons = form.querySelectorAll('button[type="submit"]');
    submitButtons.forEach((btn) => {
      btn.disabled = true;
      btn.textContent = "جاري تأكيد الطلب...";
    });

    try {

      const paidAmount = Number(formData.get("paidAmount") || 0);

      if (!paidAmount || paidAmount <= 0) {
        showWarning("أدخل مبلغًا مدفوعًا صحيحًا أكبر من صفر.");
        return;
      }

      const response = await checkoutOrder(formData);

      localStorage.removeItem("naqsha_shipping_data");
      localStorage.removeItem("naqsha_payment_data");
      localStorage.removeItem("naqsha_checkout_totals");

      const orderNumber =
        response?.data?.order_number ||
        response?.data?.order?.order_number ||
        "";

      if (orderNumber) {
        window.location.href = `order-success.html?order=${encodeURIComponent(orderNumber)}`;
      } else {
        window.location.href = "order-success.html";
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showError(error.message || "فشل تأكيد الطلب، تأكد من تشغيل الباك إند.");
    } finally {
      submitButtons.forEach((btn) => {
        btn.disabled = false;
        btn.textContent = "حفظ وتأكيد البيانات";
      });
    }
  });
}

function getShippingData() {
  try {
    return JSON.parse(localStorage.getItem("naqsha_shipping_data"));
  } catch {
    return null;
  }
}

function renderCheckoutItems(items) {
  const container = document.querySelector("[data-checkout-items]");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div class="checkout-empty">
        لا توجد منتجات في الطلب
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const name = item.product_name || item.name || "منتج";
      const quantity = Number(item.quantity || 1);
      const price = Number(
        item.unit_price || item.price || item.base_price || 0,
      );
      const size = item.size || item.variant_size || "-";
      const color = item.color || item.variant_color || "-";
      const image = item.product_image || item.main_image || item.image_url;

      return `
        <div class="checkout-summary-item checkout-summary-product">
          <img class="checkout-summary-image" src="${resolveImageUrl(image)}" alt="${escapeHtml(name)}">
          <div class="checkout-summary-product-info">
            <strong>${escapeHtml(name)}</strong>
            <p>اللون: ${escapeHtml(color)} | المقاس: ${escapeHtml(size)}</p>
            <div class="checkout-summary-item-meta">
              <p>${quantity} × ${formatPrice(price)}</p>
              <span>${formatPrice(quantity * price)}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderCheckoutTotals(items, cart) {
  const savedTotals = getSavedTotals();

  const subtotal =
    Number(cart.subtotal) ||
    Number(savedTotals.subtotal) ||
    items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(
        item.unit_price || item.price || item.base_price || 0,
      );
      return sum + quantity * price;
    }, 0);
  


  const shipping = Number(cart.shipping_fee || savedTotals.shipping || 15);
  const tax = Number(cart.tax || savedTotals.tax || 0);
  const total = subtotal + shipping + tax;
  

  setText("[data-checkout-subtotal]", formatPrice(subtotal));
  setText("[data-checkout-shipping]", formatPrice(shipping));
  setText("[data-checkout-tax]", formatPrice(tax));
  setText("[data-checkout-total]", formatPrice(total));
  setPaidAmount(total);
}

function getSavedTotals() {
  try {
    return JSON.parse(localStorage.getItem("naqsha_checkout_totals")) || {};
  } catch {
    return {};
  }
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value ?? "";
}

function formatPrice(value) {
  return `${Number(value || 0).toFixed(0)}₪`;
}

function setPaidAmount(total) {
  const paidAmountInput = document.querySelector("[data-paid-amount]");

  if (paidAmountInput) {
    paidAmountInput.value = toEnglishNumber(Number(total || 0).toFixed(2));
  }
}

function toEnglishNumber(value) {
  return String(value)
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
}
