import { getProductById, getProducts, getProductsStats } from "./api/products-api.js";
import { createProductCard } from "./components/product-card.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHomeProducts();
  await loadProductsStats();
});

async function loadHomeProducts() {
  try {
    const response = await getProducts();
    const items = response.data || [];

    const menGrid = document.querySelector('[data-product-grid="men"]');
    const womenGrid = document.querySelector('[data-product-grid="women"]');
    const kidsGrid = document.querySelector('[data-product-grid="kids"]');

    if (menGrid) menGrid.innerHTML = "";
    if (womenGrid) womenGrid.innerHTML = "";
    if (kidsGrid) kidsGrid.innerHTML = "";

    for (const item of items) {
      const detailsJson = await getProductById(item.id);
      const product = detailsJson.data;

      const card = createProductCard(product);

      const categoryName = normalizeText(product.category_name || "");

      const isWomen =
        categoryName.includes("نساء") ||
        categoryName.includes("نسائي") ||
        categoryName.includes("فساتين") ||
        categoryName.includes("فستان") ||
        categoryName.includes("عبايات") ||
        categoryName.includes("عبايه") ||
        categoryName.includes("اطقم") ||
        categoryName.includes("طقم");

      const isMen =
        categoryName.includes("رجال") || categoryName.includes("رجالي");

      const isKids =
        categoryName.includes("اطفال") || categoryName.includes("طفل");

      // مهم: نفحص النساء قبل الرجال
      if (isWomen && womenGrid) {
        womenGrid.appendChild(card);
      } else if (isKids && kidsGrid) {
        kidsGrid.appendChild(card);
      } else if (isMen && menGrid) {
        menGrid.appendChild(card);
      } else if (womenGrid) {
        womenGrid.appendChild(card);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function loadProductsStats() {
  try {
    const response = await getProductsStats();
    const stats = response.data || {};

    const totalPiecesEl = document.querySelector("[data-total-pieces]");

    if (totalPiecesEl) {
      totalPiecesEl.textContent = `+${Number(stats.total_pieces || 0)}`;
    }
  } catch (error) {
    console.error("Products stats error:", error.message);
  }
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ً-ْ]/g, "");
}
