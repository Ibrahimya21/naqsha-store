import {
  apiRequest,
  setAuthData,
  clearAuthData,
  getCurrentUser,
} from "./http.js";

export const registerUser = async (payload) => {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (data?.data?.token && data?.data?.user) {
    setAuthData({
      token: data.data.token,
      user: data.data.user,
    });
  }

  return data;
};

export const loginUser = async (payload) => {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (data?.data?.token && data?.data?.user) {
    setAuthData({
      token: data.data.token,
      user: data.data.user,
    });
  }

  return data;
};

export const fetchMe = async () => {
  return apiRequest("/auth/me");
};

export const logoutUser = () => {
  clearAuthData();
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "admin";
};
