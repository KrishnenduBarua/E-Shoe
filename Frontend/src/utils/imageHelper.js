/**
 * Helper function to get correct image URL
 * Handles both Cloudinary URLs (absolute) and local storage paths (relative)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // If the path starts with protocol-relative URL (//), add https:
  if (imagePath.startsWith("//")) {
    return `https:${imagePath}`;
  }

  // If the path is already an absolute URL (Cloudinary), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Otherwise, prepend the backend URL (local storage)
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace("/api", "");
  return `${baseUrl}${imagePath}`;
};
