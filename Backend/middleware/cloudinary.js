import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Determine if we should use Cloudinary (production) or local storage (development)
const USE_CLOUDINARY =
  process.env.NODE_ENV === "production" &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY;

let storage;

if (USE_CLOUDINARY) {
  // Cloudinary storage for production
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "flick/products",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    },
  });
} else {
  // Local storage for development
  const uploadsDir = path.join(__dirname, "..", "uploads", "products");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
      cb(null, sanitizedName + "-" + uniqueSuffix + ext);
    },
  });
}

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware to handle multiple image uploads
export const uploadProductImages = upload.array("images", 10); // Max 10 images

// Helper function to get image URL
export const getImageUrl = (file) => {
  if (USE_CLOUDINARY) {
    // Cloudinary URL
    return file.path;
  } else {
    // Local URL
    return `/uploads/products/${file.filename}`;
  }
};

// Helper function to delete uploaded files (cleanup on error)
export const deleteUploadedFiles = async (files) => {
  if (!files || files.length === 0) return;

  try {
    if (USE_CLOUDINARY) {
      // Delete from Cloudinary
      for (const file of files) {
        if (file.filename) {
          await cloudinary.uploader.destroy(file.filename);
        }
      }
    } else {
      // Delete local files
      for (const file of files) {
        const filePath = file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (error) {
    console.error("Error deleting uploaded files:", error);
  }
};

// Helper function to delete a single image
export const deleteImage = async (imageUrl) => {
  try {
    if (USE_CLOUDINARY) {
      // Extract public_id from Cloudinary URL
      const matches = imageUrl.match(/\/flick\/products\/(.+)\./);
      if (matches && matches[1]) {
        const publicId = `flick/products/${matches[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    } else {
      // Delete local file
      const filename = path.basename(imageUrl);
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        filename,
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

export { cloudinary };
