import { getCart, updateCartItem, removeCartItem } from "./api/cart-api.js";
import { resolveImageUrl } from "./utils/image.js";


document.addEventListener("DOMContentLoaded", async () => {
  await loadCartPage();
});

async function loadCartPage() {
  try {
    const response = await getCart();
    const cart = response.data || {};
    const items = cart.items || cart.cart_items || [];

    renderCartItems(items);
    renderCartSummary(items, cart);
  } catch (error) {
    console.error(error);
    renderCartError();
  }
}

function renderCartItems(items) {
  const container = document.querySelector("[data-cart-items]");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart card">
        <h2>السلة فارغة</h2>
        <p class="muted">لم تقم بإضافة أي منتجات بعد.</p>
        <a class="btn" href="index.html">ابدأ التسوق</a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item) => renderCartItem(item)).join("");

  bindCartActions();
}

function renderCartItem(item) {
  const itemId = item.id || item.cart_item_id;
  const productName = item.product_name || item.name || "منتج";
  const productImage =
    item.product_image ||
    item.main_image ||
    item.image_url ||
    item.product?.main_image;

  const size = item.size || item.variant_size || item.product_size || "-";
  const color = item.color || item.variant_color || item.product_color || "-";
  const quantity = Number(item.quantity || 1);
  const price = Number(item.unit_price || item.price || item.base_price || 0);
  const total = price * quantity;

  return `
    <article class="cart-product-card card" data-cart-item="${escapeHtml(itemId)}">
      <div class="cart-product-image">
        <img
          src="${resolveImageUrl(productImage)}"
          alt="${escapeHtml(productName)}"
        />
      </div>

      <div class="cart-product-content">
        <div class="cart-product-main">
          <div>
            <h3>${escapeHtml(productName)}</h3>
            <div class="cart-product-options">
              <span>المقاس: ${escapeHtml(size)}</span>
              <span>اللون: ${escapeHtml(color)}</span>
            </div>
          </div>

          <button
            class="cart-remove-btn"
            type="button"
            data-remove-cart-item="${escapeHtml(itemId)}"
            aria-label="حذف المنتج"
          >
            حذف
          </button>
        </div>

        <div class="cart-product-bottom">
          <div class="cart-quantity-control">
            <button
              type="button"
              data-decrease-quantity="${escapeHtml(itemId)}"
              ${quantity <= 1 ? "disabled" : ""}
            >
              -
            </button>

            <span>${quantity}</span>

            <button
              type="button"
              data-increase-quantity="${escapeHtml(itemId)}"
            >
              +
            </button>
          </div>

          <div class="cart-price-box">
            <span>${formatPrice(price)} للقطعة</span>
            <strong>${formatPrice(total)}</strong>
          </div>
        </div>
      </div>
    </article>
  `;
}

function bindCartActions() {
  document.querySelectorAll("[data-increase-quantity]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemId = btn.dataset.increaseQuantity;
      const currentQuantity = getCurrentQuantity(btn);

      await updateQuantity(itemId, currentQuantity + 1);
    });
  });

  document.querySelectorAll("[data-decrease-quantity]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemId = btn.dataset.decreaseQuantity;
      const currentQuantity = getCurrentQuantity(btn);

      if (currentQuantity <= 1) return;

      await updateQuantity(itemId, currentQuantity - 1);
    });
  });

  document.querySelectorAll("[data-remove-cart-item]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemId = btn.dataset.removeCartItem;

      const confirmed = await showConfirm({
        title: "حذف المنتج",
        message: "هل تريد حذف المنتج من السلة؟",
        confirmText: "نعم، احذف",
        cancelText: "إلغاء",
      });

      if (!confirmed) return;
      try {
        await removeCartItem(itemId);
        await loadCartPage();
      } catch (error) {
        showError(error.message || "فشل حذف المنتج من السلة");
      }
    });
  });
}

function getCurrentQuantity(button) {
  const card = button.closest("[data-cart-item]");
  const quantityText = card?.querySelector(
    ".cart-quantity-control span",
  )?.textContent;
  return Number(quantityText || 1);
}

async function updateQuantity(itemId, quantity) {
  try {
    await updateCartItem(itemId, { quantity });
    await loadCartPage();
  } catch (error) {
    showError(error.message || "فشل تحديث الكمية");
  }
}

function renderCartSummary(items, cart) {
  const subtotalEl = document.querySelector("[data-cart-subtotal]");
  const shippingEl = document.querySelector("[data-cart-shipping]");
  const taxEl = document.querySelector("[data-cart-tax]");
  const totalEl = document.querySelector("[data-cart-total]");

  const subtotal =
    Number(cart.subtotal) ||
    items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(
        item.unit_price || item.price || item.base_price || 0,
      );
      return sum + quantity * price;
    }, 0);

  const shipping = Number(cart.shipping_fee || 0);
  const tax = Number(cart.tax || 0);
  const total = Number(cart.total_amount) || subtotal + shipping + tax;

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  if (shippingEl) {
    shippingEl.textContent =
      shipping > 0 ? formatPrice(shipping) : "يُحسب عند الشحن";
  }

  if (taxEl) taxEl.textContent = formatPrice(tax);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

function renderCartError() {
  const container = document.querySelector("[data-cart-items]");
  if (!container) return;

  container.innerHTML = `
    <div class="empty-cart card">
      <h2>حدث خطأ</h2>
      <p class="muted">تعذر تحميل السلة. تأكد من تسجيل الدخول وتشغيل الباك إند.</p>
    </div>
  `;
}

function formatPrice(price) {
  return `${Number(price || 0).toFixed(0)}₪`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
