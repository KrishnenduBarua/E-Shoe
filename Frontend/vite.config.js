import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: [
    "**/*.PNG",
    "**/*.JPG",
    "**/*.JPEG",
    "**/*.GIF",
    "**/*.SVG",
    "**/*.ico",
    "**/*.ICO",
  ],
  server: {
    port: 5173,
    strictPort: false,
    headers: {
      // Security headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  build: {
    sourcemap: false, // Disable source maps in production for security
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
