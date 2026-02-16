/**
 * Helper function to get correct image URL (v2 - with malformed URL fix)
 * Handles both Cloudinary URLs (absolute) and local storage paths (relative)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // Convert to string and trim any whitespace
  const path = String(imagePath).trim();

  console.log('[getImageUrl] Input:', path); // Debug log

  // Check for cloudinary.com first (regardless of protocol)
  if (path.includes("cloudinary.com") || path.includes("res.cloudinary")) {
    // Fix malformed protocols
    let fixedUrl = path
      .replace(/^https\/\//, "https://") // Fix https//
      .replace(/^http\/\//, "http://") // Fix http//
      .replace(/^\/\//, "https://"); // Fix //

    // If still no protocol, add https://
    if (!fixedUrl.match(/^https?:\/\//)) {
      fixedUrl = `https://${fixedUrl}`;
    }

    console.log('[getImageUrl] Fixed Cloudinary URL:', fixedUrl); // Debug log
    return fixedUrl;
  }

  // If the path starts with protocol-relative URL (//), add https:
  if (path.startsWith("//")) {
    return `https:${path}`;
  }

  // If the path is already an absolute URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Otherwise, prepend the backend URL (local storage)
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace("/api", "");
  return `${baseUrl}${path}`;
};
