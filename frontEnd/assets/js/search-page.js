import { getProductById, getProducts } from "./api/products-api.js";
import { createProductCard } from "./components/product-card.js";

const CATEGORY_PRESETS = {
  رجال: ["رجال", "men", "man", "male"],
  نساء: ["نساء", "نسائي", "women", "woman", "female"],
  أطفال: ["أطفال", "اطفال", "kids", "children", "child"],
};

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const label = document.querySelector("[data-search-label]");
  const presetButtons = document.querySelectorAll("[data-search-preset]");

  if (!results) return;

  async function runSearch(labelText = "كل المنتجات") {
    const query = input?.value?.trim() || "";

    try {
      results.innerHTML = `<div class="search-loading">جاري تحميل المنتجات...</div>`;

      const response = await getProducts({ search: query });
      const allItems = response.data || [];
      const items = filterByPreset(allItems, query).slice(0, 8);

      if (label) {
        label.textContent = query ? labelText || `نتائج البحث عن: ${query}` : "كل المنتجات";
      }

      results.classList.toggle("is-single-result", items.length === 1);
      results.innerHTML = "";

      for (const item of items) {
        const detailsJson = await getProductById(item.id);
        const product = detailsJson.data;
        const card = createProductCard(product);
        results.appendChild(card);
      }

      if (!items.length) {
        results.innerHTML = `
          <div class="card search-empty">
            <h3>لا توجد نتائج</h3>
            <p>جرّب كلمة بحث مختلفة أو اختر تصنيفًا آخر.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error(error.message);
      results.innerHTML = `
        <div class="card search-empty">
          <h3>تعذر تحميل المنتجات</h3>
          <p>تأكد من تشغيل الباك إند ثم أعد المحاولة.</p>
        </div>
      `;
    }
  }

  function filterByPreset(items, query) {
    const terms = CATEGORY_PRESETS[query];
    if (!terms) return items;

    return items.filter((item) => {
      const haystack = [
        item.category_name,
        item.category_slug,
        item.name,
        item.slug,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return terms.some((term) => haystack.includes(term.toLowerCase()));
    });
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await runSearch();
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const preset = button.dataset.searchPreset || "";

      presetButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      if (input) {
        input.value = preset;
      }

      await runSearch(button.dataset.searchLabelText || `نتائج: ${preset}`);
    });
  });

  input?.addEventListener("input", async () => {
    presetButtons.forEach((btn) => btn.classList.remove("is-active"));
    await runSearch();
  });

  await runSearch();
});
