import { apiRequest } from "./http.js";

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  return apiRequest(`/products?${query.toString()}`);
};

export const getProductById = async (id) => {
  return apiRequest(`/products/${id}`);
};

export const getProductsStats = async () => {
  return apiRequest("/products/stats");
};
