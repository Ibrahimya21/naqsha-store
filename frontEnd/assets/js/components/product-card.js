import { resolveImageUrl } from "../utils/image.js";
import { addToCart } from "../api/cart-api.js";


function getAvailableVariants(variants = []) {
  return variants.filter((variant) => Number(variant.stock || 0) > 0);
}

function getUniqueColors(variants = []) {
  return [...new Set(getAvailableVariants(variants).map((v) => v.color).filter(Boolean))];
}

function getUniqueSizesByColor(variants = [], color) {
  return [
    ...new Set(
      getAvailableVariants(variants)
        .filter((v) => v.color === color)
        .map((v) => v.size)
        .filter(Boolean),
    ),
  ];
}

function getVariantByColorAndSize(variants = [], color, size) {
  return variants.find((v) => v.color === color && v.size === size);
}

function getImageByVariant(images = [], color, size, fallback) {
  const exactMatch = images.find(
    (img) => img.variant_color === color && img.variant_size === size,
  );

  const colorMatch = images.find((img) => img.variant_color === color);
  const mainImage = images.find((img) => Number(img.is_main) === 1);

  return exactMatch?.image_url || colorMatch?.image_url || mainImage?.image_url || fallback;
}

function getProductDisplayImage(product) {
  const mainImageFromGallery = product.images?.find(
    (image) => Number(image.is_main) === 1 && !image.variant_color && !image.variant_size,
  )?.image_url;

  const anyMainImage = product.images?.find((image) => Number(image.is_main) === 1)?.image_url;
  const firstImage = product.images?.[0]?.image_url;

  return (
    product.main_image ||
    product.image_url ||
    product.primary_image ||
    product.product_image ||
    mainImageFromGallery ||
    anyMainImage ||
    firstImage ||
    ""
  );
}

function getColorHex(color) {
  const colorMap = {
    Black: "#111111",
    White: "#ffffff",
    Gray: "#9ca3af",
    Grey: "#9ca3af",
    Blue: "#2563eb",
    Navy: "#1e3a8a",
    Red: "#dc2626",
    Burgundy: "#7f1d1d",
    Green: "#166534",
    Olive: "#556b2f",
    Beige: "#d6b48c",
    Brown: "#7c4a2d",
    Cream: "#f5f0dc",
    Pink: "#f9a8d4",
    Orange: "#f97316",
    Yellow: "#eab308",
    Purple: "#7e22ce",
    

    أسود: "#111111",
    أبيض: "#ffffff",
    رمادي: "#9ca3af",
    أزرق: "#2563eb",
    كحلي: "#1e3a8a",
    أحمر: "#dc2626",
    خمري: "#7f1d1d",
    أخضر: "#166534",
    زيتي: "#556b2f",
    بيج: "#d6b48c",
    بني: "#7c4a2d",
    كريمي: "#f5f0dc",
    وردي: "#f9a8d4",
    برتقالي: "#f97316",
    أصفر: "#eab308",
    بنفسجي: "#7e22ce",
  };

  return colorMap[color] || color || "#d1d5db";
}

function renderColorOptions(product, activeColor) {
  const colors = getUniqueColors(product.variants || []);

  return colors
    .map(
      (color) => `
        <button
          type="button"
          class="color-swatch ${color === activeColor ? "active" : ""}"
          data-color="${escapeHtml(color)}"
          title="${escapeHtml(color)}"
          style="background:${getColorHex(color)}"
        ></button>
      `,
    )
    .join("");
}

function renderSizeOptions(product, activeColor, activeSize) {
  const sizes = getUniqueSizesByColor(product.variants || [], activeColor);

  return sizes
    .map(
      (size) => `
        <button
          type="button"
          class="size-chip product-size-btn ${size === activeSize ? "active" : ""}"
          data-size="${escapeHtml(size)}"
        >
          ${escapeHtml(size)}
        </button>
      `,
    )
    .join("");
}

function formatPrice(price) {
  return `${price}₪`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createProductCard(product) {
  const article = document.createElement("article");

  const colors = getUniqueColors(product.variants || []);
  let currentColor = colors[0] || null;

  const initialSizes = getUniqueSizesByColor(
    product.variants || [],
    currentColor,
  );
  let currentSize = initialSizes[0] || null;
  let hasUserSelectedVariant = false;

  article.className = "card product-card unified-product-card";
  article.setAttribute("data-product-card", "");
  article.setAttribute("data-product-id", product.id);
  article.setAttribute("data-selected-color", currentColor || "");
  article.setAttribute("data-selected-size", currentSize || "");

  function render() {
    const availableSizes = getUniqueSizesByColor(
      product.variants || [],
      currentColor,
    );

    if (!availableSizes.includes(currentSize)) {
      currentSize = availableSizes[0] || null;
    }

    const currentVariant = getVariantByColorAndSize(
      product.variants || [],
      currentColor,
      currentSize,
    );

    const isAvailable = Boolean(currentVariant) && Number(currentVariant.stock || 0) > 0;
    const currentPrice = currentVariant?.price || product.base_price;
    const currentImage = hasUserSelectedVariant
      ? getImageByVariant(
          product.images || [],
          currentColor,
          currentSize,
          getProductDisplayImage(product),
        )
      : getProductDisplayImage(product);

    const subtitle = product.description || product.category_name || "";

    article.innerHTML = `
      <div class="product-image">
        <img
          src="${resolveImageUrl(currentImage)}"
          alt="${escapeHtml(product.name)}"
          class="product-main-image"
        />
      </div>

      <div class="product-body">
        <div class="product-meta">
          <div>
            <h3>${escapeHtml(product.name)}</h3>
          </div>
          <div class="price">${formatPrice(currentPrice)}</div>
        </div>

        <div class="product-divider"></div>

        <div class="product-detail-row">
          <span>الألوان</span>
          <div class="swatches">
            ${renderColorOptions(product, currentColor)}
          </div>
        </div>

        <div class="product-options-block product-sizes-block">
          <div class="product-options-label">المقاسات</div>
          <div class="product-size-grid">
            ${renderSizeOptions(product, currentColor, currentSize)}
          </div>
        </div>

        <button class="product-cta" type="button" data-add-to-cart ${!isAvailable ? "disabled" : ""}>
          ${isAvailable ? "إضافة للسلة" : "غير متوفر حاليًا"}
        </button>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    article.querySelectorAll("[data-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        hasUserSelectedVariant = true;
        currentColor = btn.dataset.color;
        const nextSizes = getUniqueSizesByColor(
          product.variants || [],
          currentColor,
        );
        currentSize = nextSizes[0] || null;
        render();
      });
    });

    article.querySelectorAll("[data-size]").forEach((btn) => {
      btn.addEventListener("click", () => {
        hasUserSelectedVariant = true;
        currentSize = btn.dataset.size;
        render();
      });
    });

    const button = article.querySelector("[data-add-to-cart]");
    button.addEventListener("click", async () => {
      try {
        const selectedVariant = getVariantByColorAndSize(
          product.variants || [],
          currentColor,
          currentSize,
        );

        if (!selectedVariant) {
          showWarning("اختر اللون والمقاس أولًا");
          return;
        }

        if (Number(selectedVariant.stock || 0) <= 0) {
          showWarning("هذا المقاس أو اللون غير متوفر في المخزون");
          return;
        }

        await addToCart({
          product_variant_id: selectedVariant.id,
          quantity: 1,
        });

        showSuccess("تمت إضافة المنتج إلى السلة");
      } catch (error) {
        showError(error.message || "فشل في إضافة المنتج إلى السلة.");
      }
    });
  }

  render();
  return article;
}
