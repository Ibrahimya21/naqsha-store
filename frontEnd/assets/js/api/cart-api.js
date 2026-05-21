import { apiRequest } from "./http.js";

export const getCart = async () => apiRequest("/cart");

export const addToCart = async (payload) =>
  apiRequest("/cart", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCartItem = async (itemId, payload) =>
  apiRequest(`/cart/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const removeCartItem = async (itemId) =>
  apiRequest(`/cart/${itemId}`, {
    method: "DELETE",
  });
