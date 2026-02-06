import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // localhost와 네트워크 접근 모두 허용
    port: 5173,
    strictPort: false,
  },
  build: {
    // Image optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'motion/react', 'lucide-react', 'axios'],
  },
});
