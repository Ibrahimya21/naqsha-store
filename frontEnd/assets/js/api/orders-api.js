import { apiRequest } from "./http.js";

export const getMyOrders = async () => apiRequest("/orders");

export const getMyOrderById = async (id) => apiRequest(`/orders/${id}`);

export const getPaymentInstructions = async (provider) =>
  apiRequest(`/payments/instructions/${provider}`);

export const submitPaymentProof = async (payload) =>
  apiRequest("/payments/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  export const checkoutOrder = async (formData) => {
    return apiRequest("/orders/checkout", {
      method: "POST",
      body: formData,
    });
  };
