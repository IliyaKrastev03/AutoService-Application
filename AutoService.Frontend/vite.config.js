import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://iliyaauto-001-site1.stempurl.com",
        changeOrigin: true,
      },
    },
  },
});
