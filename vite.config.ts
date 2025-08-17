import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: true,
    port: 5175,
    strictPort: false,
    hmr: { host: "192.168.1.122", port: 5175 },
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
