import { API_ORIGIN } from "../api/config.js";

const FALLBACK_IMAGE = "https://dummyimage.com/600x800/eaeaea/666&text=Naqsha";

function optimizeCloudinaryUrl(url) {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  if (url.includes("/upload/f_auto,q_auto,w_600/")) {
    return url;
  }

  return url.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
}

export const resolveImageUrl = (path) => {
  if (!path) {
    return FALLBACK_IMAGE;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return optimizeCloudinaryUrl(path);
  }

  if (path.startsWith("/uploads")) {
    return `${API_ORIGIN}${path}`;
  }

  return `${API_ORIGIN}/uploads/${path.replace(/^\/+/, "")}`;
};
