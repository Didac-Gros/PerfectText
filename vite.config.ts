import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: "localhost",
    port: 5175,
    strictPort: false,
    watch: {
      usePolling: true,
    },
    open: true,
    proxy: {
      // Opcional: Redirige las solicitudes de la API al backend en desarrollo
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  // build: {
  //   outDir: "dist",
  // },
});
