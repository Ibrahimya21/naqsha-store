import { API_ORIGIN } from "../api/config.js";

export const resolveImageUrl = (path) => {
  if (!path) {
    return "https://dummyimage.com/600x800/eaeaea/666&text=Naqsha";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/uploads")) {
    return `${API_ORIGIN}${path}`;
  }

  return `${API_ORIGIN}/uploads/${path.replace(/^\/+/, "")}`;
};
