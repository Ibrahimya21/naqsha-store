import { getCurrentUser } from "./api/http.js";
import { API_ORIGIN } from "./api/config.js";
import { getProductById } from "./api/products-api.js";
import {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderDetails,
  reviewPayment,
  updateOrderStatus,
  getAdminUsers,
  updateUserRole,
  toggleUserStatus,
  getStoreSettings,
  updateStoreSettings,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  getAllProductsForAdmin,
  getAllCategoriesForAdmin,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  uploadProductImage,
} from "./api/admin-api.js";


const user = getCurrentUser();
let selectedOrderId = null;
let selectedPaymentId = null;
let allOrdersCache = [];
let filteredOrdersCache = [];
let allPaymentsCache = [];
let filteredPaymentsCache = [];
let allProductsCache = [];
let filteredProductsCache = [];
let allCategoriesCache = [];
let productVariantsDraft = [];
let productImagesDraft = [];
let editingProductId = null;
let editingVariantIndex = null;
let editingImageIndex = null;
let productSkuDraftCode = createSkuDraftCode();
let productSkuSequence = 1;

if (!user || user.role !== "admin") {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([
      loadDashboard(),
      loadOrders(),
      loadProducts(),
      loadCategories(),
      loadUsers(),
      loadSettings(),
    ]);

    await loadPayments();

    bindSettingsSave();
    bindOrderDetailsActions();
    bindCategoryCreate();
    bindProductModal();
    bindProductCreate();
    bindSimpleProductInputs();
    renderVariantsDraft();
    renderImagesDraft();
  } catch (error) {
    console.error("Admin init error:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("adminUserMenuBtn");
  const menu = document.getElementById("adminUserMenu");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  const adminUserName = document.getElementById("adminUserName");
  const adminUserRole = document.getElementById("adminUserRole");
  const adminAvatar = document.getElementById("adminAvatar");

  const user =
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(localStorage.getItem("naqsha.user") || "null");

  if (user) {
    const name = user.full_name || user.name || "Admin";
    const role = user.role || "admin";

    if (adminUserName) adminUserName.textContent = name;
    if (adminUserRole)
      adminUserRole.textContent = role === "admin" ? "Admin" : "User";
    if (adminAvatar) adminAvatar.textContent = name.trim().slice(0, 2);
  }

  menuBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    menu?.classList.toggle("is-open");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".admin-user-dropdown")) {
      menu?.classList.remove("is-open");
    }
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("naqsha.user");
    localStorage.removeItem("naqsha_user");

    window.location.href = "login.html";
  });
});

async function loadDashboard() {
  try {
    const response = await getDashboardStats();
    const data = response?.data || {};

    setText("stat-total-orders", data.total_orders ?? 0);
    setText("stat-pending-payments", data.pending_payments ?? 0);
    setText("stat-total-products", data.total_products ?? 0);
    setText("stat-total-sales", `₪ ${data.total_sales ?? 0}`);

    renderDashboardLatestOrders(data.latest_orders || []);
    renderDashboardLowStock(data.low_stock_items || []);
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}

function renderDashboardLatestOrders(orders) {
  const tbody = document.getElementById("dashboard-latest-orders-body");
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">لا توجد طلبات حديثة</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td>#${escapeHtml(order.order_number)}</td>
      <td>${escapeHtml(order.customer_name)}</td>
      <td>${formatPaymentMethod(order.payment_method)}</td>
      <td>${renderStatusBadge(order.status)}</td>
      <td>₪ ${Number(order.total_amount || 0)}</td>
    </tr>
  `,
    )
    .join("");
}

function renderDashboardLowStock(items) {
  const list = document.getElementById("dashboard-low-stock-list");
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<div class="empty-state">لا توجد عناصر منخفضة المخزون</div>`;
    return;
  }

  list.innerHTML = items
    .map((item) => {
      const lowClass = Number(item.stock) <= 1 ? "stock-very-low" : "stock-low";
      return `
      <div class="list-item ${lowClass}">
        <div>
          <div class="mini-title">${escapeHtml(item.product_name)}</div>
          <p class="mini-sub">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</p>
        </div>
        <span class="badge-soft ${Number(item.stock) <= 1 ? "badge-danger-soft" : "badge-warning-soft"}">
          ${item.stock} قطع
        </span>
      </div>
    `;
    })
    .join("");
}

async function loadOrders() {
  try {
    const response = await getAdminOrders();
    const orders = response?.data || [];

    allOrdersCache = orders;
    filteredOrdersCache = [...orders];

    renderOrdersTable(filteredOrdersCache);
    bindOrdersFilters();
  } catch (error) {
    console.error("Orders error:", error);
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById("admin-orders-table-body");
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted py-4">لا توجد طلبات مطابقة</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td>#${escapeHtml(order.order_number)}</td>
      <td>${escapeHtml(order.customer_name)}</td>
      <td>${escapeHtml(order.customer_phone || "-")}</td>
      <td>${escapeHtml(order.city || "-")}</td>
      <td>${formatPaymentMethod(order.payment_method)}</td>
      <td>${renderStatusBadge(order.status)}</td>
      <td>₪ ${Number(order.total_amount || 0)}</td>
      <td>
        <button class="btn btn-outline-naqsha btn-sm" type="button" data-view-order-details="${order.id}">
          عرض التفاصيل
        </button>
      </td>
    </tr>
  `,
    )
    .join("");

  tbody.querySelectorAll("[data-view-order-details]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.viewOrderDetails;
      await loadOrderDetails(orderId);
      if (typeof window.showPage === "function") {
        window.showPage("order-details");
      }
    });
  });
}

function bindOrdersFilters() {
  const searchBtn = document.getElementById("orders-search-btn");
  const resetBtn = document.getElementById("orders-reset-filters-btn");
  const exportBtn = document.getElementById("orders-export-btn");
  const searchInput = document.getElementById("orders-search-input");
  const statusFilter = document.getElementById("orders-status-filter");
  const paymentFilter = document.getElementById("orders-payment-filter");

  if (searchBtn && !searchBtn.dataset.bound) {
    searchBtn.dataset.bound = "true";
    searchBtn.addEventListener("click", applyOrdersFilters);
  }

  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = "true";
    resetBtn.addEventListener("click", resetOrdersFilters);
  }

  if (exportBtn && !exportBtn.dataset.bound) {
    exportBtn.dataset.bound = "true";
    exportBtn.addEventListener("click", exportOrdersToCSV);
  }

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", applyOrdersFilters);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyOrdersFilters();
      }
    });
  }

  if (statusFilter && !statusFilter.dataset.bound) {
    statusFilter.dataset.bound = "true";
    statusFilter.addEventListener("change", applyOrdersFilters);
  }

  if (paymentFilter && !paymentFilter.dataset.bound) {
    paymentFilter.dataset.bound = "true";
    paymentFilter.addEventListener("change", applyOrdersFilters);
  }
}

function applyOrdersFilters() {
  const searchValue = (
    document.getElementById("orders-search-input")?.value || ""
  )
    .trim()
    .toLowerCase();
  const statusValue =
    document.getElementById("orders-status-filter")?.value || "";
  const paymentValue =
    document.getElementById("orders-payment-filter")?.value || "";

  filteredOrdersCache = allOrdersCache.filter((order) => {
    const matchesSearch =
      !searchValue ||
      String(order.order_number || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(order.customer_name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(order.customer_phone || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(order.city || "")
        .toLowerCase()
        .includes(searchValue);

    const matchesStatus = !statusValue || order.status === statusValue;
    const matchesPayment =
      !paymentValue || order.payment_method === paymentValue;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  renderOrdersTable(filteredOrdersCache);
}

function resetOrdersFilters() {
  const searchInput = document.getElementById("orders-search-input");
  const statusFilter = document.getElementById("orders-status-filter");
  const paymentFilter = document.getElementById("orders-payment-filter");

  if (searchInput) searchInput.value = "";
  if (statusFilter) statusFilter.value = "";
  if (paymentFilter) paymentFilter.value = "";

  filteredOrdersCache = [...allOrdersCache];
  renderOrdersTable(filteredOrdersCache);
}

function exportOrdersToCSV() {
  exportRowsToCSV({
    rows: filteredOrdersCache.length ? filteredOrdersCache : allOrdersCache,
    headers: [
      "رقم الطلب",
      "اسم العميل",
      "الهاتف",
      "المدينة",
      "طريقة الدفع",
      "الحالة",
      "الإجمالي",
    ],
    mapper: (order) => [
      safeCsvValue(order.order_number),
      safeCsvValue(order.customer_name),
      safeCsvValue(order.customer_phone || "-"),
      safeCsvValue(order.city || "-"),
      safeCsvValue(order.payment_method || "-"),
      safeCsvValue(order.status || "-"),
      safeCsvValue(order.total_amount || 0),
    ],
    filename: "naqsha-orders.csv",
    emptyMessage: "لا توجد بيانات لتصديرها",
  });
}

async function loadOrderDetails(orderId) {
  try {
    const response = await getAdminOrderDetails(orderId);
    const order = response?.data || {};

    selectedOrderId = order.id || null;
    selectedPaymentId = order.payments?.[0]?.id || null;

    setText("details-order-title", `تفاصيل الطلب #${order.order_number || ""}`);
    setText("details-customer-name", order.customer_name || "—");
    setText(
      "details-payment-method",
      formatPaymentMethod(order.payment_method),
    );
    setText("details-order-status", order.status || "—");
    setText("details-total-amount", `₪ ${Number(order.total_amount || 0)}`);
    setText("details-customer-email", order.customer_email || "—");
    setText("details-customer-phone", order.customer_phone || "—");
    setText(
      "details-customer-address",
      `${order.city || ""} - ${order.address_line || ""}`.trim() || "—",
    );

    const statusSelect = document.getElementById("details-status-select");
    if (statusSelect) statusSelect.value = order.status || "";

    renderOrderItems(order.items || []);
    renderPaymentDetails(order.payments?.[0] || null);
  } catch (error) {
    console.error("Order details error:", error);
    showError("تعذر تحميل تفاصيل الطلب");
  }
}

function renderOrderItems(items) {
  const tbody = document.getElementById("details-order-items-body");
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد منتجات داخل هذا الطلب</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
    <tr>
      <td>
        <div class="product-mini">
          <img class="thumb" src="${resolveAdminImage(item.product_image)}" alt="${escapeHtml(item.product_name)}">
          <div>
            <div class="mini-title">${escapeHtml(item.product_name)}</div>
            <p class="mini-sub">SKU / Variant</p>
          </div>
        </div>
      </td>
      <td>${escapeHtml(item.size || "-")}</td>
      <td>${escapeHtml(item.color || "-")}</td>
      <td>${Number(item.quantity || 0)}</td>
      <td>₪ ${Number(item.unit_price || 0)}</td>
    </tr>
  `,
    )
    .join("");
}

function renderPaymentDetails(payment) {
  const statusEl = document.getElementById("details-payment-status");
  const receiptLink = document.getElementById("details-payment-receipt-link");

  if (!payment) {
    setText("details-payment-reference", "—");
    setText("details-payer-name", "—");
    setText("details-payment-receipt-text", "لا يوجد إثبات دفع");
    if (statusEl) {
      statusEl.textContent = "—";
      statusEl.className = "status-chip status-pending";
    }
    if (receiptLink) {
      receiptLink.style.display = "none";
      receiptLink.href = "#";
    }
    setPaymentActionButtonsState(null);
    return;
  }

  setText("details-payment-reference", payment.reference_number || "—");
  setText("details-payer-name", payment.payer_name || "—");
  setText(
    "details-payment-receipt-text",
    payment.receipt_image_url ? "تم رفع إيصال" : "لا يوجد إيصال",
  );

  if (statusEl) {
    statusEl.textContent = payment.status || "pending";
    statusEl.className = `status-chip ${getStatusClass(payment.status)}`;
  }

  if (receiptLink) {
    if (payment.receipt_image_url) {
      receiptLink.href = resolveAdminImage(payment.receipt_image_url);
      receiptLink.style.display = "inline-flex";
    } else {
      receiptLink.style.display = "none";
      receiptLink.href = "#";
    }
  }

  setPaymentActionButtonsState(payment.status || "pending");
}

function setPaymentActionButtonsState(status) {
  const approveBtn = document.getElementById("details-approve-payment-btn");
  const rejectBtn = document.getElementById("details-reject-payment-btn");
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  if (approveBtn) {
    approveBtn.disabled = !status || isApproved || isRejected;
    approveBtn.textContent = isApproved ? "تم قبول الدفع" : "قبول الدفع";
  }

  if (rejectBtn) {
    rejectBtn.disabled = !status || isApproved || isRejected;
    rejectBtn.textContent = isRejected ? "تم رفض الدفع" : "رفض الدفع";
  }
}

function bindOrderDetailsActions() {
  const saveStatusBtn = document.getElementById("details-save-status-btn");
  const approveBtn = document.getElementById("details-approve-payment-btn");
  const rejectBtn = document.getElementById("details-reject-payment-btn");

  if (saveStatusBtn && !saveStatusBtn.dataset.bound) {
    saveStatusBtn.dataset.bound = "true";
    saveStatusBtn.addEventListener("click", async () => {
      const statusSelect = document.getElementById("details-status-select");
      const status = statusSelect?.value;

      if (!selectedOrderId || !status) {
        showWarning("اختر الطلب والحالة أولًا");
        return;
      }

      try {
        await updateOrderStatus(selectedOrderId, { status });
        showSuccess("تم تحديث حالة الطلب");
        await refreshAfterPaymentAction();
      } catch (error) {
        console.error(error);
        showError("فشل تحديث حالة الطلب");
      }
    });
  }

  if (approveBtn && !approveBtn.dataset.bound) {
    approveBtn.dataset.bound = "true";
    approveBtn.addEventListener("click", async () => {
      if (!selectedPaymentId) {
        showWarning("لا يوجد سجل دفع لهذا الطلب");
        return;
      }

      try {
        await reviewPayment(selectedPaymentId, {
          status: "approved",
          admin_note: "تمت الموافقة من لوحة التحكم",
        });
        showSuccess("تمت الموافقة على الدفع");
        await refreshAfterPaymentAction();
      } catch (error) {
        console.error(error);
        showError("فشل قبول الدفع");
      }
    });
  }

  if (rejectBtn && !rejectBtn.dataset.bound) {
    rejectBtn.dataset.bound = "true";
    rejectBtn.addEventListener("click", async () => {
      if (!selectedPaymentId) {
        showWarning("لا يوجد سجل دفع لهذا الطلب");
        return;
      }

      try {
        await reviewPayment(selectedPaymentId, {
          status: "rejected",
          admin_note: "تم الرفض من لوحة التحكم",
        });
        showSuccess("تم رفض الدفع");
        await refreshAfterPaymentAction();
      } catch (error) {
        console.error(error);
        showError("فشل رفض الدفع");
      }
    });
  }
}

async function refreshAfterPaymentAction() {
  await loadOrders();
  await loadPayments();
  if (selectedOrderId) {
    await loadOrderDetails(selectedOrderId);
  }
  await loadDashboard();
}

async function loadPayments() {
  try {
    const tbody = document.getElementById("admin-payments-table-body");
    if (!tbody) return;

    if (!allOrdersCache.length) {
      const ordersRes = await getAdminOrders();
      allOrdersCache = ordersRes?.data || [];
    }

    const detailResponses = await Promise.all(
      allOrdersCache.map((order) =>
        getAdminOrderDetails(order.id).catch(() => null),
      ),
    );

    const payments = detailResponses.filter(Boolean).flatMap((res) => {
      const order = res.data || {};
      const orderPayments = order.payments || [];
      return orderPayments.map((payment) => ({
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        ...payment,
      }));
    });

    allPaymentsCache = payments;
    filteredPaymentsCache = [...payments];
    renderPaymentsTable(filteredPaymentsCache);
  } catch (error) {
    console.error("Payments error:", error);
  }
}

function renderPaymentsTable(payments) {
  const tbody = document.getElementById("admin-payments-table-body");
  if (!tbody) return;

  if (!payments.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">لا توجد مدفوعات</td></tr>`;
    return;
  }

  tbody.innerHTML = payments
    .map((payment) => {
      const isApproved = payment.status === "approved";
      const isRejected = payment.status === "rejected";
      const isReviewed = isApproved || isRejected;

      return `
    <tr>
      <td>#${escapeHtml(payment.order_number)}</td>
      <td>${formatPaymentMethod(payment.provider || payment.payment_method)}</td>
      <td>${escapeHtml(payment.reference_number || "-")}</td>
      <td>${escapeHtml(payment.payer_name || "-")}</td>
      <td>₪ ${Number(payment.total_amount || 0)}</td>
      <td>${renderStatusBadge(payment.status)}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm rounded-pill" type="button" data-approve-payment="${payment.id}" ${isReviewed ? "disabled" : ""}>
            ${isApproved ? "تم القبول" : "قبول"}
          </button>
          <button class="btn btn-danger btn-sm rounded-pill" type="button" data-reject-payment="${payment.id}" ${isReviewed ? "disabled" : ""}>
            ${isRejected ? "تم الرفض" : "رفض"}
          </button>
        </div>
      </td>
    </tr>
  `;
    })
    .join("");

  tbody.querySelectorAll("[data-approve-payment]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await reviewPayment(btn.dataset.approvePayment, {
          status: "approved",
          admin_note: "تمت الموافقة من جدول المدفوعات",
        });
        showSuccess("تمت الموافقة على الدفع");
        await refreshAfterPaymentAction();
      } catch (error) {
        showError("فشل قبول الدفع");
      }
    });
  });

  tbody.querySelectorAll("[data-reject-payment]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await reviewPayment(btn.dataset.rejectPayment, {
          status: "rejected",
          admin_note: "تم الرفض من جدول المدفوعات",
        });
        showSuccess("تم رفض الدفع");
        await refreshAfterPaymentAction();
      } catch (error) {
        showError("فشل رفض الدفع");
      }
    });
  });
}

async function loadProducts() {
  try {
    const response = await getAllProductsForAdmin();
    const products = response?.data || [];
    allProductsCache = products;
    filteredProductsCache = [...products];
    await populateProductsCategoryFilter();
    await populateProductModalCategories();
    renderProductsTable(filteredProductsCache);
    bindProductsFilters();
  } catch (error) {
    console.error("Products error:", error);
  }
}

async function populateProductsCategoryFilter() {
  const select = document.getElementById("products-category-filter");
  if (!select) return;

  const response = await getAllCategoriesForAdmin();
  const categories = response?.data || [];
  allCategoriesCache = categories;

  select.innerHTML = `
    <option value="">كل التصنيفات</option>
    ${categories.map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`).join("")}
  `;
}

async function populateProductModalCategories() {
  const select = document.getElementById("product-category-select");
  if (!select) return;

  if (!allCategoriesCache.length) {
    const response = await getAllCategoriesForAdmin();
    allCategoriesCache = response?.data || [];
  }

  select.innerHTML = `
    <option value="">اختر التصنيف</option>
    ${allCategoriesCache.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join("")}
  `;
}

function renderProductsTable(products) {
  const tbody = document.getElementById("admin-products-table-body");
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          لا توجد منتجات
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products
    .map((product) => {
      const isActive = Number(product.is_active) === 1;

      return `
        <tr>
          <td>
            <div class="product-mini">
              <img
                class="thumb"
                src="${resolveAdminImage(product.main_image)}"
                alt="${escapeHtml(product.name)}"
              >
              <div>
                <div class="mini-title">${escapeHtml(product.name)}</div>
                <p class="mini-sub">${escapeHtml(product.slug || "")}</p>
              </div>
            </div>
          </td>

          <td>${escapeHtml(product.category_name || "-")}</td>

          <td>₪ ${Number(product.base_price || 0)}</td>

          <td>${Number(product.total_stock || 0)} قطعة</td>

          <td>${product.variants_count || "—"}</td>

          <td>
            <span class="status-chip ${isActive ? "status-active" : "status-inactive"}">
              ${isActive ? "فعال" : "معطل"}
            </span>
          </td>

          <td>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-naqsha btn-sm rounded-pill"
                type="button"
                data-edit-product="${product.id}"
              >
                تعديل
              </button>

              <button
                class="btn btn-outline-warning btn-sm rounded-pill"
                type="button"
                data-toggle-product="${product.id}"
              >
                ${isActive ? "تعطيل" : "تفعيل"}
              </button>

              ${Number(product.can_delete) === 1 ? `
                <button
                  class="btn btn-outline-danger btn-sm rounded-pill"
                  type="button"
                  data-delete-product="${product.id}"
                >
                  حذف
                </button>
              ` : `
                <button
                  class="btn btn-outline-secondary btn-sm rounded-pill"
                  type="button"
                  disabled
                  title="مربوط بـ ${product.order_items_count || 0} عنصر طلب و ${product.cart_items_count || 0} عنصر سلة"
                >
                  مرتبط
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  bindProductActionButtons();
}

function bindProductActionButtons() {
  document.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", async () => {
      await openProductModalForEdit(button.dataset.editProduct);
    });
  });

  document.querySelectorAll("[data-toggle-product]").forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.dataset.toggleProduct;
      const originalText = button.textContent;

      try {
        button.disabled = true;
        button.textContent = "جاري...";

        await toggleProductStatus(productId);

        await loadProducts();
        await loadDashboard();

        showSuccess("تم تحديث حالة المنتج بنجاح");
      } catch (error) {
        console.error(error);
        showError(error.message || "فشل تحديث حالة المنتج");
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });

  document.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.dataset.deleteProduct;
      const originalText = button.textContent;

      const confirmed = await showConfirm({
        title: "حذف المنتج",
        message: "هل أنت متأكد من حذف هذا المنتج؟",
        confirmText: "نعم، احذف",
        cancelText: "إلغاء",
      });

      if (!confirmed) return;

      try {
        button.disabled = true;
        button.textContent = "جاري الحذف...";

        await deleteProduct(productId);
        await loadProducts();
        await loadDashboard();

        showSuccess("تم حذف المنتج بنجاح");
      } catch (error) {
        console.error(error);
        showError(error.message || "فشل حذف المنتج");
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
}

function bindProductsFilters() {
  const searchBtn = document.getElementById("products-search-btn");
  const resetBtn = document.getElementById("products-reset-filters-btn");
  const exportBtn = document.getElementById("products-export-btn");
  const searchInput = document.getElementById("products-search-input");
  const categoryFilter = document.getElementById("products-category-filter");
  const statusFilter = document.getElementById("products-status-filter");

  if (searchBtn && !searchBtn.dataset.bound) {
    searchBtn.dataset.bound = "true";
    searchBtn.addEventListener("click", applyProductsFilters);
  }

  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = "true";
    resetBtn.addEventListener("click", resetProductsFilters);
  }

  if (exportBtn && !exportBtn.dataset.bound) {
    exportBtn.dataset.bound = "true";
    exportBtn.addEventListener("click", exportProductsToCSV);
  }

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", applyProductsFilters);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyProductsFilters();
      }
    });
  }

  if (categoryFilter && !categoryFilter.dataset.bound) {
    categoryFilter.dataset.bound = "true";
    categoryFilter.addEventListener("change", applyProductsFilters);
  }

  if (statusFilter && !statusFilter.dataset.bound) {
    statusFilter.dataset.bound = "true";
    statusFilter.addEventListener("change", applyProductsFilters);
  }
}

function applyProductsFilters() {
  const searchValue = (
    document.getElementById("products-search-input")?.value || ""
  )
    .trim()
    .toLowerCase();
  const categoryValue =
    document.getElementById("products-category-filter")?.value || "";
  const statusValue =
    document.getElementById("products-status-filter")?.value || "";

  filteredProductsCache = allProductsCache.filter((product) => {
    const matchesSearch =
      !searchValue ||
      String(product.name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(product.slug || "")
        .toLowerCase()
        .includes(searchValue);

    const matchesCategory =
      !categoryValue || String(product.category_name || "") === categoryValue;
    const productStatus =
      Number(product.is_active) === 1 ? "active" : "inactive";
    const matchesStatus = !statusValue || productStatus === statusValue;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderProductsTable(filteredProductsCache);
}

function resetProductsFilters() {
  const searchInput = document.getElementById("products-search-input");
  const categoryFilter = document.getElementById("products-category-filter");
  const statusFilter = document.getElementById("products-status-filter");

  if (searchInput) searchInput.value = "";
  if (categoryFilter) categoryFilter.value = "";
  if (statusFilter) statusFilter.value = "";

  filteredProductsCache = [...allProductsCache];
  renderProductsTable(filteredProductsCache);
}

function exportProductsToCSV() {
  exportRowsToCSV({
    rows: filteredProductsCache.length
      ? filteredProductsCache
      : allProductsCache,
    headers: ["اسم المنتج", "Slug", "التصنيف", "السعر الأساسي", "المخزون", "الحالة"],
    mapper: (product) => [
      safeCsvValue(product.name),
      safeCsvValue(product.slug || ""),
      safeCsvValue(product.category_name || "-"),
      safeCsvValue(product.base_price || 0),
      safeCsvValue(product.total_stock || 0),
      safeCsvValue(Number(product.is_active) === 1 ? "فعال" : "معطل"),
    ],
    filename: "naqsha-products.csv",
    emptyMessage: "لا توجد منتجات لتصديرها",
  });
}

function bindProductModal() {
  const backdrop = document.getElementById("product-modal-backdrop");
  const openBtn = document.getElementById("open-product-modal-btn");
  const closeBtn = document.getElementById("close-product-modal-btn");
  const clearBtn = document.getElementById("clear-product-form-btn");

  if (openBtn && !openBtn.dataset.bound) {
    openBtn.dataset.bound = "true";
    openBtn.addEventListener("click", () => {
      openProductModalForCreate();
    });
  }

  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.dataset.bound = "true";
    closeBtn.addEventListener("click", closeProductModal);
  }

  if (clearBtn && !clearBtn.dataset.bound) {
    clearBtn.dataset.bound = "true";
    clearBtn.addEventListener("click", clearProductForm);
  }

  if (backdrop && !backdrop.dataset.bound) {
    backdrop.dataset.bound = "true";
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeProductModal();
      }
    });

    const modal = backdrop.querySelector(".modal-naqsha");

    modal?.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }
}

const PRODUCT_SIZE_OPTIONS = [
  "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL",
  "6Y", "8Y", "10Y", "12Y",
  "28", "29", "30", "31", "32", "33", "34", "36", "38", "40", "42", "44", "46",
];
const PRODUCT_COLOR_OPTIONS = [
  { value: "Black", label: "أسود", swatch: "#111827" },
  { value: "White", label: "أبيض", swatch: "#ffffff" },
  { value: "Blue", label: "أزرق", swatch: "#2563eb" },
  { value: "Navy", label: "كحلي", swatch: "#1e3a8a" },
  { value: "Red", label: "أحمر", swatch: "#dc2626" },
  { value: "Pink", label: "وردي", swatch: "#f472b6" },
  { value: "Green", label: "أخضر", swatch: "#16a34a" },
  { value: "Olive", label: "زيتي", swatch: "#556B2F" },
  { value: "Beige", label: "بيج", swatch: "#d6b98c" },
  { value: "Brown", label: "بني", swatch: "#92400e" },
  { value: "Gray", label: "رمادي", swatch: "#6b7280" },
  { value: "Orange", label: "برتقالي", swatch: "#f97316" },
  { value: "Purple", label: "بنفسجي", swatch: "#7c3aed" },
];

function bindSimpleProductInputs() {
  renderAttributeOptions();

  const generateBtn = document.getElementById("generate-variants-btn");
  const applyBulkBtn = document.getElementById("apply-bulk-variants-btn");

  if (generateBtn && !generateBtn.dataset.bound) {
    generateBtn.dataset.bound = "true";
    generateBtn.addEventListener("click", () => {
      generateVariantsFromSelections();
    });
  }

  if (applyBulkBtn && !applyBulkBtn.dataset.bound) {
    applyBulkBtn.dataset.bound = "true";
    applyBulkBtn.addEventListener("click", () => {
      applyBulkValuesToVariants();
    });
  }
}

function renderAttributeOptions() {
  const sizeContainer = document.getElementById("product-size-options");
  const colorContainer = document.getElementById("product-color-options");

  if (sizeContainer && !sizeContainer.dataset.rendered) {
    sizeContainer.dataset.rendered = "true";
    sizeContainer.innerHTML = PRODUCT_SIZE_OPTIONS.map(
      (size) => `
        <label class="product-chip">
          <input type="checkbox" name="product_sizes" value="${escapeHtml(size)}">
          <span>${escapeHtml(size)}</span>
        </label>
      `,
    ).join("");

    sizeContainer.querySelectorAll('input[name="product_sizes"]').forEach((input) => {
      input.addEventListener("change", () => {
        updateColorImageInputs();
      });
    });
  }

  if (colorContainer && !colorContainer.dataset.rendered) {
    colorContainer.dataset.rendered = "true";
    colorContainer.innerHTML = PRODUCT_COLOR_OPTIONS.map(
      (color) => `
        <label class="product-chip color-chip">
          <input type="checkbox" name="product_colors" value="${escapeHtml(color.value)}">
          <span class="color-swatch" style="--chip-color: ${escapeHtml(color.swatch)}"></span>
          <span>${escapeHtml(color.label)}</span>
        </label>
      `,
    ).join("");

    colorContainer.querySelectorAll('input[name="product_colors"]').forEach((input) => {
      input.addEventListener("change", () => {
        updateColorImageInputs();
      });
    });
  }

  updateColorImageInputs();
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (input) => input.value,
  );
}

function setCheckedValues(name, values) {
  const normalized = new Set((values || []).map((value) => String(value).toLowerCase()));
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = normalized.has(String(input.value).toLowerCase());
  });
}

function getColorLabel(colorValue) {
  const option = PRODUCT_COLOR_OPTIONS.find(
    (item) => item.value.toLowerCase() === String(colorValue).toLowerCase(),
  );
  return option?.label || colorValue;
}

function getColorSwatch(colorValue) {
  const option = PRODUCT_COLOR_OPTIONS.find(
    (item) => item.value.toLowerCase() === String(colorValue).toLowerCase(),
  );
  return option?.swatch || "#e5e7eb";
}

function findImageForColor(color) {
  return productImagesDraft.find(
    (image) => image.variant_color?.toLowerCase() === String(color).toLowerCase(),
  );
}

function updateColorImageInputs() {
  const wrapper = document.getElementById("selected-color-images");
  if (!wrapper) return;

  const colors = getCheckedValues("product_colors");

  if (!colors.length) {
    wrapper.innerHTML = `<div class="admin-mini-empty">اختر لونًا واحدًا على الأقل حتى تظهر خانة صورة اللون</div>`;
    return;
  }

  wrapper.innerHTML = colors
    .map((color) => {
      const existingImage = findImageForColor(color);
      const imageUrl = existingImage?.image_url || "";
      const preview = imageUrl
        ? `<img src="${resolveAdminImage(imageUrl)}" alt="${escapeHtml(getColorLabel(color))}">`
        : `<span>لا توجد صورة</span>`;

      return `
        <div class="color-image-card" data-color-image-card="${escapeHtml(color)}">
          <div class="color-image-card-head">
            <span class="color-swatch" style="--chip-color: ${escapeHtml(getColorSwatch(color))}"></span>
            <strong>${escapeHtml(getColorLabel(color))}</strong>
          </div>
          <div class="color-image-preview">${preview}</div>
          <input type="file" accept="image/*" data-color-image-input="${escapeHtml(color)}">
          <small>${imageUrl ? "يمكنك تركها كما هي أو اختيار صورة جديدة" : "اختر صورة هذا اللون"}</small>
        </div>
      `;
    })
    .join("");
}

function generateVariantsFromSelections() {
  const sizes = getCheckedValues("product_sizes");
  const colors = getCheckedValues("product_colors");
  const defaultPrice = Number(getValue("bulk-variant-price-input") || getValue("product-base-price-input") || 0);
  const defaultStock = Number(getValue("bulk-variant-stock-input") || 0);

  if (!sizes.length || !colors.length) {
    showWarning("اختر مقاسًا ولونًا واحدًا على الأقل");
    return;
  }

  const oldByKey = new Map(
    productVariantsDraft.map((variant) => [
      `${String(variant.color).toLowerCase()}__${String(variant.size).toLowerCase()}`,
      variant,
    ]),
  );

  const nextVariants = [];

  colors.forEach((color) => {
    sizes.forEach((size) => {
      const key = `${String(color).toLowerCase()}__${String(size).toLowerCase()}`;
      const oldVariant = oldByKey.get(key);
      nextVariants.push({
        id: oldVariant?.id || null,
        size,
        color,
        stock: Number(oldVariant?.stock ?? defaultStock ?? 0),
        price: Number(oldVariant?.price ?? defaultPrice ?? 0),
        sku: oldVariant?.sku || buildVariantSku(color, size),
      });
    });
  });

  productVariantsDraft = nextVariants;
  editingVariantIndex = null;
  renderVariantsDraft();
  updateColorImageInputs();
  showSuccess("تم توليد المتغيرات حسب المقاسات والألوان المختارة");
}

function createSkuDraftCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function normalizeSkuPart(value, fallback = "ITEM") {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\u0600-\u06FF]+/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function getProductSkuCode() {
  const productName = getValue("product-name-input");
  const englishPart = normalizeSkuPart(productName, "").slice(0, 10);

  return englishPart || `NQ${productSkuDraftCode}`;
}

function buildVariantSku(color, size) {
  const productPart = getProductSkuCode();
  const colorPart = normalizeSkuPart(color, "COLOR");
  const sizePart = normalizeSkuPart(size, "SIZE");
  const sequence = String(productSkuSequence++).padStart(2, "0");

  return `${productPart}-${productSkuDraftCode}-${colorPart}-${sizePart}-${sequence}`;
}

function isAutoGeneratedLegacySku(sku) {
  return /^NAQSHA-[A-Z0-9-]+-[A-Z0-9-]+$/i.test(String(sku || "").trim());
}

function ensureUniqueVariantSkus({ forceRegenerate = false } = {}) {
  const used = new Set();

  productVariantsDraft = productVariantsDraft.map((variant) => {
    let sku = String(variant.sku || "").trim();

    if (forceRegenerate || !sku || isAutoGeneratedLegacySku(sku) || used.has(sku.toUpperCase())) {
      sku = buildVariantSku(variant.color, variant.size);
    }

    while (used.has(sku.toUpperCase())) {
      sku = buildVariantSku(variant.color, variant.size);
    }

    used.add(sku.toUpperCase());

    return {
      ...variant,
      sku,
    };
  });
}

function applyBulkValuesToVariants() {
  const price = getValue("bulk-variant-price-input");
  const stock = getValue("bulk-variant-stock-input");

  if (!productVariantsDraft.length) {
    showWarning("ولّد المتغيرات أولًا");
    return;
  }

  if (price === "" && stock === "") {
    showWarning("أدخل السعر أو الكمية لتطبيقها على المتغيرات");
    return;
  }

  productVariantsDraft = productVariantsDraft.map((variant) => ({
    ...variant,
    price: price !== "" ? Number(price) : Number(variant.price || 0),
    stock: stock !== "" ? Number(stock) : Number(variant.stock || 0),
  }));

  renderVariantsDraft();
  showSuccess("تم تطبيق السعر والكمية على كل المتغيرات");
}

function clearVariantInputs() {
  editingVariantIndex = null;
  updateVariantButtonText();
}

function clearImageInputs() {
  editingImageIndex = null;
  updateImageButtonText();
}

function renderVariantsDraft() {
  const list = document.getElementById("variants-list");
  if (!list) return;

  if (!productVariantsDraft.length) {
    list.innerHTML = `<div class="admin-mini-empty">لم يتم توليد متغيرات بعد</div>`;
    return;
  }

  list.innerHTML = `
    <div class="variants-edit-table">
      <div class="variants-edit-head">
        <span>اللون</span>
        <span>المقاس</span>
        <span>السعر</span>
        <span>الكمية</span>
        <span>SKU</span>
        <span></span>
      </div>
      ${productVariantsDraft
        .map(
          (variant, index) => `
            <div class="variants-edit-row" data-variant-row="${index}">
              <div class="variant-color-cell">
                <span class="color-swatch" style="--chip-color: ${escapeHtml(getColorSwatch(variant.color))}"></span>
                <strong>${escapeHtml(getColorLabel(variant.color))}</strong>
              </div>
              <strong>${escapeHtml(variant.size)}</strong>
              <input type="number" min="0" step="0.01" value="${Number(variant.price || 0)}" data-variant-price="${index}">
              <input type="number" min="0" value="${Number(variant.stock || 0)}" data-variant-stock="${index}">
              <input type="text" value="${escapeHtml(variant.sku || "")}" data-variant-sku="${index}">
              <button class="admin-mini-remove" type="button" data-remove-variant="${index}">حذف</button>
            </div>
          `,
        )
        .join("")}
    </div>
  `;

  list.querySelectorAll("[data-variant-price]").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.variantPrice);
      if (productVariantsDraft[index]) productVariantsDraft[index].price = Number(input.value || 0);
    });
  });

  list.querySelectorAll("[data-variant-stock]").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.variantStock);
      if (productVariantsDraft[index]) productVariantsDraft[index].stock = Number(input.value || 0);
    });
  });

  list.querySelectorAll("[data-variant-sku]").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.variantSku);
      if (productVariantsDraft[index]) productVariantsDraft[index].sku = input.value.trim();
    });
  });

  list.querySelectorAll("[data-remove-variant]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.removeVariant);
      productVariantsDraft.splice(index, 1);
      renderVariantsDraft();
      updateSelectedOptionsFromDrafts();
      updateColorImageInputs();
    });
  });
}

function updateVariantButtonText() {}

function renderImagesDraft() {
  updateColorImageInputs();
}

function updateImageButtonText() {}

function updateSelectedOptionsFromDrafts() {
  const sizes = Array.from(new Set(productVariantsDraft.map((variant) => variant.size).filter(Boolean)));
  const colors = Array.from(new Set(productVariantsDraft.map((variant) => variant.color).filter(Boolean)));
  setCheckedValues("product_sizes", sizes);
  setCheckedValues("product_colors", colors);
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(String(value));
  }

  return String(value).replace(/"/g, '\"');
}

async function syncColorImagesBeforeSave(mainImage) {
  const selectedColors = getCheckedValues("product_colors");
  const selectedSizes = getCheckedValues("product_sizes");
  const nextImages = [];

  if (mainImage) {
    nextImages.push({
      image_url: mainImage,
      is_main: true,
      sort_order: 0,
      variant_color: null,
      variant_size: null,
    });
  }

  for (const color of selectedColors) {
    const input = document.querySelector(`[data-color-image-input="${cssEscape(color)}"]`);
    const file = input?.files?.[0];
    const existingImage = findImageForColor(color);
    let imageUrl = existingImage?.image_url || "";

    if (file) {
      const uploadResponse = await uploadProductImage(file);
      imageUrl = uploadResponse?.data?.image_url || uploadResponse?.data?.url || uploadResponse?.image_url || uploadResponse?.url || "";
    }

    if (!imageUrl) {
      throw new Error(`اختر صورة للون ${getColorLabel(color)} قبل حفظ المنتج`);
    }

    selectedSizes.forEach((size, index) => {
      nextImages.push({
        image_url: imageUrl,
        is_main: false,
        sort_order: index + 1,
        variant_color: color,
        variant_size: size,
      });
    });
  }

  const extraImages = productImagesDraft.filter((image) => {
    if (!image.variant_color) return false;
    return !selectedColors.some(
      (color) => String(color).toLowerCase() === String(image.variant_color).toLowerCase(),
    );
  });

  productImagesDraft = [...nextImages, ...extraImages];
}

function closeProductModal() {
  document.getElementById("product-modal-backdrop")?.classList.remove("active");
}

function clearProductForm() {
  setValue("product-name-input", "");
  setValue("product-category-select", "");
  setValue("product-base-price-input", "");
  setValue("bulk-variant-price-input", "");
  setValue("bulk-variant-stock-input", "");
  const mainImageInput = document.getElementById("product-main-image-input");
  if (mainImageInput) mainImageInput.value = "";
  setValue("product-main-image-url", "");
  setValue("product-description-input", "");
  clearVariantInputs();
  clearImageInputs();
  productVariantsDraft = [];
  productImagesDraft = [];
  editingVariantIndex = null;
  editingImageIndex = null;
  productSkuDraftCode = createSkuDraftCode();
  productSkuSequence = 1;
  setCheckedValues("product_sizes", []);
  setCheckedValues("product_colors", []);
  renderVariantsDraft();
  renderImagesDraft();
}


function openProductModalForCreate() {
  editingProductId = null;
  clearProductForm();
  setText("product-modal-title", "إضافة منتج جديد");
  setText("save-product-btn", "حفظ المنتج");
  document.getElementById("product-modal-backdrop")?.classList.add("active");
}

async function openProductModalForEdit(productId) {
  try {
    editingProductId = productId;
    const response = await getProductById(productId);
    const product = response?.data;

    if (!product) {
      showError("تعذر تحميل بيانات المنتج");
      return;
    }

    clearProductForm();
    editingProductId = productId;

    setText("product-modal-title", "تعديل المنتج");
    setText("save-product-btn", "حفظ التعديل");
    setValue("product-name-input", product.name || "");
    setValue("product-category-select", product.category_id || "");
    setValue("product-base-price-input", product.base_price || "");
    setValue("product-description-input", product.description || "");
    setValue("product-main-image-url", stripApiOrigin(product.main_image || ""));

    productVariantsDraft = (product.variants || []).map((variant) => ({
      id: variant.id || null,
      size: variant.size || "",
      color: variant.color || "",
      stock: Number(variant.stock || 0),
      price: Number(variant.price || product.base_price || 0),
      sku: variant.sku || "",
    }));

    productImagesDraft = (product.images || []).map((image, index) => ({
      id: image.id || null,
      image_url: stripApiOrigin(image.image_url || ""),
      is_main: Boolean(Number(image.is_main)),
      sort_order: Number(image.sort_order || index + 1),
      variant_color: image.variant_color || null,
      variant_size: image.variant_size || null,
    }));

    updateSelectedOptionsFromDrafts();
    renderVariantsDraft();
    renderImagesDraft();
    document.getElementById("product-modal-backdrop")?.classList.add("active");
  } catch (error) {
    console.error(error);
    showError(error.message || "فشل فتح نموذج تعديل المنتج");
  }
}

function stripApiOrigin(path) {
  if (!path) return "";
  return String(path).replace(API_ORIGIN, "");
}

function bindProductCreate() {
  const saveBtn = document.getElementById("save-product-btn");
  if (!saveBtn || saveBtn.dataset.bound) return;

  saveBtn.dataset.bound = "true";
  saveBtn.addEventListener("click", async () => {
    try {
      const name = getValue("product-name-input");
      const categoryId = getValue("product-category-select");
      const basePrice = getValue("product-base-price-input");
      let mainImage = getValue("product-main-image-url");

      const mainImageInput = document.getElementById(
        "product-main-image-input",
      );
      const mainImageFile = mainImageInput?.files?.[0];

      if (mainImageFile) {
        const uploadResponse = await uploadProductImage(mainImageFile);
        mainImage = uploadResponse?.data?.image_url || uploadResponse?.data?.url || uploadResponse?.image_url || uploadResponse?.url || "";
      }
      const draftMainImage = productImagesDraft.find((image) => image.is_main)?.image_url;
      if (!mainImage && draftMainImage) {
        mainImage = draftMainImage;
      }

      if (productVariantsDraft.length) {
        await syncColorImagesBeforeSave(mainImage);
      }

      const description = getValue("product-description-input");

      if (!name || !categoryId || !basePrice) {
        showWarning("الاسم والتصنيف والسعر الأساسي مطلوبة");
        return;
      }

      ensureUniqueVariantSkus({ forceRegenerate: !editingProductId });

      const payload = {
        category_id: Number(categoryId),
        name,
        description,
        base_price: Number(basePrice),
        main_image: mainImage || null,
        variants: productVariantsDraft,
        images: productImagesDraft,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        showSuccess("تم تعديل المنتج بنجاح");
      } else {
        await createProduct(payload);
        showSuccess("تم إنشاء المنتج بنجاح");
      }
      productVariantsDraft = [];
      productImagesDraft = [];
      editingProductId = null;

      clearProductForm();
      renderVariantsDraft();
      renderImagesDraft();
      closeProductModal();
      await loadProducts();
      await loadDashboard();
    } catch (error) {
      console.error(error);
      showError(error.message || "فشل حفظ المنتج. تأكد من صحة البيانات والمتغيرات والصور.");
    }
  });
}

async function loadCategories() {
  try {
    const response = await getAllCategoriesForAdmin();
    const categories = response?.data || [];
    allCategoriesCache = categories;
    const list = document.getElementById("admin-categories-list");
    if (!list) return;

    if (!categories.length) {
      list.innerHTML = `<div class="empty-state">لا توجد تصنيفات</div>`;
      return;
    }

    list.innerHTML = categories
      .map(
        (category) => `
      <div class="list-item category-list-item" data-category-row="${category.id}">
        <div class="category-view" data-category-view="${category.id}">
          <div class="mini-title">${escapeHtml(category.name)}</div>
          <p class="mini-sub">slug: ${escapeHtml(category.slug || "-")}</p>
        </div>

        <div class="category-edit-form" data-category-edit-form="${category.id}" hidden>
          <input class="form-control form-control-sm" value="${escapeHtml(category.name)}" data-category-edit-input="${category.id}">
          <div class="d-flex gap-2 flex-wrap mt-2">
            <button class="btn btn-naqsha btn-sm" type="button" data-save-category="${category.id}">حفظ</button>
            <button class="btn btn-outline-naqsha btn-sm" type="button" data-cancel-category-edit="${category.id}">إلغاء</button>
          </div>
        </div>

        <div class="d-flex gap-2 flex-wrap category-actions">
          <button class="btn btn-outline-naqsha btn-sm" type="button" data-edit-category="${category.id}">تعديل</button>
          <button class="btn btn-outline-danger btn-sm" type="button" data-delete-category="${category.id}">حذف</button>
        </div>
      </div>
    `,
      )
      .join("");

    bindCategoryListActions(list);
    await populateProductsCategoryFilter();
    await populateProductModalCategories();
  } catch (error) {
    console.error("Categories error:", error);
  }
}

function bindCategoryListActions(list) {
  list.querySelectorAll("[data-edit-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.dataset.editCategory;
      const view = list.querySelector(`[data-category-view="${categoryId}"]`);
      const form = list.querySelector(`[data-category-edit-form="${categoryId}"]`);
      if (view) view.hidden = true;
      if (form) form.hidden = false;
    });
  });

  list.querySelectorAll("[data-cancel-category-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.dataset.cancelCategoryEdit;
      const view = list.querySelector(`[data-category-view="${categoryId}"]`);
      const form = list.querySelector(`[data-category-edit-form="${categoryId}"]`);
      if (view) view.hidden = false;
      if (form) form.hidden = true;
    });
  });

  list.querySelectorAll("[data-save-category]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const categoryId = btn.dataset.saveCategory;
      const input = list.querySelector(`[data-category-edit-input="${categoryId}"]`);
      const name = input?.value.trim();

      if (!name) {
        showWarning("أدخل اسم التصنيف");
        return;
      }

      try {
        btn.disabled = true;
        btn.textContent = "جاري الحفظ...";
        await updateCategory(categoryId, { name });
        await loadCategories();
        await loadProducts();
        showSuccess("تم تعديل التصنيف");
      } catch (error) {
        showError(error.message || "فشل تعديل التصنيف");
      } finally {
        btn.disabled = false;
        btn.textContent = "حفظ";
      }
    });
  });

  list.querySelectorAll("[data-delete-category]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const categoryId = btn.dataset.deleteCategory;
      const confirmed = await showConfirm({
        title: "حذف التصنيف",
        message: "هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن حذف تصنيف مربوط بمنتجات.",
        confirmText: "نعم، احذف",
        cancelText: "إلغاء",
      });

      if (!confirmed) return;

      try {
        btn.disabled = true;
        btn.textContent = "جاري الحذف...";
        await deleteCategory(categoryId);
        await loadCategories();
        await loadProducts();
        showSuccess("تم حذف التصنيف");
      } catch (error) {
        showError(error.message || "فشل حذف التصنيف");
      } finally {
        btn.disabled = false;
        btn.textContent = "حذف";
      }
    });
  });
}

function bindCategoryCreate() {
  const saveBtn = document.getElementById("save-category-btn");
  const input = document.getElementById("category-name-input");
  if (!saveBtn || !input || saveBtn.dataset.bound) return;

  saveBtn.dataset.bound = "true";
  saveBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) {
      showWarning("أدخل اسم التصنيف");
      return;
    }

    try {
      await createCategory({ name });
      input.value = "";
      await loadCategories();
      showSuccess("تم إنشاء التصنيف");
    } catch (error) {
      console.error(error);
      showError("فشل إنشاء التصنيف");
    }
  });
}

async function loadUsers() {
  try {
    const response = await getAdminUsers();
    const users = response?.data || [];
    const tbody = document.getElementById("admin-users-table-body");
    if (!tbody) return;

    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">لا يوجد مستخدمون</td></tr>`;
      return;
    }

    tbody.innerHTML = users
      .map(
        (user) => `
      <tr>
        <td>
          <div class="user-mini">
            <div class="admin-avatar" style="width:40px;height:40px;font-size:.9rem;">${getUserInitials(user.full_name)}</div>
            <div>
              <div class="mini-title">${escapeHtml(user.full_name)}</div>
              <p class="mini-sub">${user.role === "admin" ? "مشرف" : "مستخدم"}</p>
            </div>
          </div>
        </td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="badge-soft ${user.role === "admin" ? "badge-info-soft" : "badge-primary-soft"}">${escapeHtml(user.role)}</span></td>
        <td><span class="status-chip ${user.is_active ? "status-active" : "status-inactive"}">${user.is_active ? "مفعل" : "معطل"}</span></td>
        <td>${formatDate(user.created_at)}</td>
        <td>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-warning btn-sm" type="button" data-toggle-role="${user.id}" data-current-role="${user.role}">تغيير الدور</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-toggle-user-status="${user.id}">${user.is_active ? "تعطيل" : "تفعيل"}</button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    tbody.querySelectorAll("[data-toggle-role]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const nextRole = btn.dataset.currentRole === "admin" ? "user" : "admin";
        try {
          await updateUserRole(btn.dataset.toggleRole, { role: nextRole });
          await loadUsers();
          showSuccess("تم تحديث الدور");
        } catch (error) {
          showError("فشل تحديث الدور");
        }
      });
    });

    tbody.querySelectorAll("[data-toggle-user-status]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await toggleUserStatus(btn.dataset.toggleUserStatus);
          await loadUsers();
          showSuccess("تم تحديث حالة المستخدم");
        } catch (error) {
          showError("فشل تحديث حالة المستخدم");
        }
      });
    });
  } catch (error) {
    console.error("Users error:", error);
  }
}

async function loadSettings() {
  try {
    const response = await getStoreSettings();
    const settings = response?.data;
    if (!settings) return;

    setValue("setting-store-name", settings.store_name);
    setValue("setting-store-email", settings.store_email);
    setValue("setting-store-phone", settings.store_phone);
    setValue("setting-store-address", settings.store_address);
    setValue("setting-currency", settings.currency);
    setValue("setting-shipping-fee", settings.shipping_fee);
    setValue("setting-bank-beneficiary-name", settings.bank_beneficiary_name);
    setValue("setting-bank-name", settings.bank_name);
    setValue("setting-bank-iban", settings.bank_iban);
    setValue("setting-jawwal-pay-number", settings.jawwal_pay_number);
    setValue("setting-palpay-number", settings.palpay_number);
    setValue("setting-logo-url", settings.logo_url);
  } catch (error) {
    console.error("Settings error:", error);
  }
}

function bindSettingsSave() {
  const saveBtn = document.getElementById("save-settings-btn");
  if (!saveBtn || saveBtn.dataset.bound) return;

  saveBtn.dataset.bound = "true";
  saveBtn.addEventListener("click", async () => {
    const payload = {
      store_name: getValue("setting-store-name"),
      store_email: getValue("setting-store-email"),
      store_phone: getValue("setting-store-phone"),
      store_address: getValue("setting-store-address"),
      currency: getValue("setting-currency"),
      shipping_fee: Number(getValue("setting-shipping-fee") || 0),
      bank_beneficiary_name: getValue("setting-bank-beneficiary-name"),
      bank_name: getValue("setting-bank-name"),
      bank_iban: getValue("setting-bank-iban"),
      jawwal_pay_number: getValue("setting-jawwal-pay-number"),
      palpay_number: getValue("setting-palpay-number"),
      logo_url: getValue("setting-logo-url"),
    };

    try {
      await updateStoreSettings(payload);
      showSuccess("تم حفظ الإعدادات بنجاح");
      await loadSettings();
    } catch (error) {
      console.error(error);
      showError("فشل حفظ الإعدادات");
    }
  });
}

function exportRowsToCSV({ rows, headers, mapper, filename, emptyMessage }) {
  if (!rows.length) {
    showWarning(emptyMessage);
    return;
  }

  const csvRows = [
    headers.join(","),
    ...rows.map((row) => mapper(row).join(",")),
  ];
  const blob = new Blob(["\\uFEFF" + csvRows.join("\\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function safeCsvValue(value) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function formatPaymentMethod(method) {
  const map = {
    bank_transfer: "تحويل بنك فلسطين",
    jawwal_pay: "Jawwal Pay",
    palpay: "PalPay",
  };
  return map[method] || method || "-";
}

function renderStatusBadge(status) {
  return `<span class="status-chip ${getStatusClass(status)}">${escapeHtml(status)}</span>`;
}

function getStatusClass(status) {
  const statusClassMap = {
    pending: "status-pending",
    paid: "status-paid",
    approved: "status-approved",
    processing: "status-processing",
    shipped: "status-shipped",
    completed: "status-completed",
    cancelled: "status-cancelled",
    rejected: "status-rejected",
  };
  return statusClassMap[status] || "status-pending";
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ar-EG");
}

function getUserInitials(name = "") {
  return name.trim().slice(0, 2) || "؟";
}

function resolveAdminImage(path) {
  if (!path) {
    return "https://dummyimage.com/100x100/eaeaea/666&text=No+Image";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/uploads")) {
    return `${API_ORIGIN}${path}`;
  }
  return `${API_ORIGIN}/uploads/${path.replace(/^\/+/, "")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Safety: prevent accidental full page reloads from buttons/forms inside admin modals.
document.addEventListener("submit", (event) => {
  const productModal = document.getElementById("product-modal-backdrop");

  if (productModal?.classList.contains("active")) {
    event.preventDefault();
    event.stopPropagation();
  }
});
