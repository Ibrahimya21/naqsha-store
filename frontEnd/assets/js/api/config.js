export const API_BASE_URL = "https://naqsha-backend.onrender.com/api";
const DEFAULT_API_BASE_URL = "https://naqsha-backend.onrender.com/api";
window.NAQSHA_API_URL ||
  localStorage.getItem("naqsha_api_base_url") ||
  DEFAULT_API_BASE_URL;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const STORAGE_KEYS = {
  token: "naqsha.token",
  user: "naqsha.user",
};
