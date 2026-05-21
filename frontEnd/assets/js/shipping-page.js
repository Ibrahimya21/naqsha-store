import { getCart } from "./api/cart-api.js";
import { resolveImageUrl } from "./utils/image.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadCheckoutSummary();
  bindShippingForm();
});

async function loadCheckoutSummary() {
  try {
    const response = await getCart();
    const cart = response.data || {};
    const items = cart.items || cart.cart_items || [];

    renderCheckoutItems(items);
    renderCheckoutTotals(items, cart);
  } catch (error) {
    console.error("Shipping cart error:", error);
  }
}

function bindShippingForm() {
  const form = document.getElementById("shipping-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);

    const shippingData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      city: formData.get("city"),
      address: formData.get("address"),
      postalCode: formData.get("postalCode"),
      notes: formData.get("notes") || "",
    };

    localStorage.setItem("naqsha_shipping_data", JSON.stringify(
    shippingData 
    ));

    window.location.href = "payment-transfer.html";
  });
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
        <div class="checkout-summary-item checkout-summary-product shipping-summary-product">
          <img class="checkout-summary-image" src="${resolveImageUrl(image)}" alt="${escapeHtml(name)}">
          <div class="checkout-summary-product-info">
            <strong>${escapeHtml(name)}</strong>
            <p class="checkout-summary-variant">اللون: ${escapeHtml(color)} | المقاس: ${escapeHtml(size)}</p>
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
  const subtotal =
    Number(cart.subtotal) ||
    items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(
        item.unit_price || item.price || item.base_price || 0,
      );
      return sum + quantity * price;
    }, 0);

  const shipping = Number(cart.shipping_fee || 15);
  const tax = Number(cart.tax || 0);
  const total = subtotal + shipping + tax;

  setText("[data-checkout-subtotal]", formatPrice(subtotal));
  setText("[data-checkout-shipping]", formatPrice(shipping));
  setText("[data-checkout-tax]", formatPrice(tax));
  setText("[data-checkout-total]", formatPrice(total));

  localStorage.setItem(
    "naqsha_checkout_totals",
    JSON.stringify({
      subtotal,
      shipping,
      tax,
      total,
    }),
  );
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function formatPrice(value) {
  return `${Number(value || 0).toFixed(0)}₪`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
