// src/utils/media.js

export const mediaUrl = (path) => {
  if (!path) return "";

  // Cloudinary / External URL
  if (path.startsWith("http")) {
    return path;
  }

  // ❗ No local fallback (since you don't use local storage)
  return path;
};
