import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        // Frontend gọi /api/... => Vite forward sang Flask
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    // KHÔNG đưa API keys vào frontend
    define: {
      // Nếu code cũ có dùng process.env ở browser, để trống cho khỏi crash
      "process.env": {},
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
