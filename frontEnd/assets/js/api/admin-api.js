import { apiRequest } from "./http.js";

export const getDashboardStats = async () => apiRequest("/admin/dashboard");

export const getAdminOrders = async () => apiRequest("/admin/orders");

export const getAdminOrderDetails = async (orderId) =>
  apiRequest(`/admin/orders/${orderId}`);

export const reviewPayment = async (paymentId, payload) =>
  apiRequest(`/admin/payments/${paymentId}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateOrderStatus = async (orderId, payload) =>
  apiRequest(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getAdminUsers = async () => apiRequest("/admin/users");

export const updateUserRole = async (userId, payload) =>
  apiRequest(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const toggleUserStatus = async (userId) =>
  apiRequest(`/admin/users/${userId}/toggle-status`, {
    method: "PATCH",
  });

  export const uploadProductImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiRequest("/admin/products/upload-image", {
      method: "POST",
      body: formData,
    });
  };

export const getStoreSettings = async () => apiRequest("/admin/settings");

export const updateStoreSettings = async (payload) =>
  apiRequest("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const createCategory = async (payload) =>
  apiRequest("/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCategory = async (categoryId, payload) =>
  apiRequest(`/admin/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteCategory = async (categoryId) =>
  apiRequest(`/admin/categories/${categoryId}`, {
    method: "DELETE",
  });

export const createProduct = async (payload) =>
  apiRequest("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateProduct = async (productId, payload) =>
  apiRequest(`/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const toggleProductStatus = async (productId) =>
  apiRequest(`/admin/products/${productId}/toggle-status`, {
    method: "PATCH",
  });

export const deleteProduct = async (productId) =>
  apiRequest(`/admin/products/${productId}`, {
    method: "DELETE",
  });

/* نستخدم public endpoints للعرض */
export const getAllProductsForAdmin = async () =>
  apiRequest(`/admin/products?t=${Date.now()}`);

export const getAllCategoriesForAdmin = async () =>
  apiRequest(`/categories?t=${Date.now()}`);
