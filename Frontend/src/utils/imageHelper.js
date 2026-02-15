/**
 * Helper function to get correct image URL
 * Handles both Cloudinary URLs (absolute) and local storage paths (relative)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  
  // Trim any whitespace
  imagePath = imagePath.trim();

  // Fix malformed Cloudinary URLs (https// instead of https://)
  if (imagePath.startsWith("https//")) {
    return imagePath.replace("https//", "https://");
  }

  if (imagePath.startsWith("http//")) {
    return imagePath.replace("http//", "http://");
  }
  
  // Check if it contains cloudinary domain (even if malformed)
  if (imagePath.includes("cloudinary.com")) {
    // Ensure it has proper protocol
    if (!imagePath.startsWith("http://") && !imagePath.startsWith("https://")) {
      // Fix malformed URLs
      if (imagePath.startsWith("https//")) {
        return imagePath.replace("https//", "https://");
      }
      if (imagePath.startsWith("http//")) {
        return imagePath.replace("http//", "http://");
      }
      if (imagePath.startsWith("//")) {
        return `https:${imagePath}`;
      }
      // If no protocol at all, add https://
      return `https://${imagePath}`;
    }
    return imagePath;
  }

  // If the path starts with protocol-relative URL (//), add https:
  if (imagePath.startsWith("//")) {
    return `https:${imagePath}`;
  }

  // If the path is already an absolute URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Otherwise, prepend the backend URL (local storage)
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace("/api", "");
  return `${baseUrl}${imagePath}`;
};
