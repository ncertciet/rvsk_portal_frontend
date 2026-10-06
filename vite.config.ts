import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: 3000,
      allowedHosts: ["rvsk.diksha.gov.in"],

      proxy: {
        "/api/v1/schemes": {
          target: env.VITE_SCHEMES_API_URL?.replace("/api/v1", ""),
          changeOrigin: true,
        },

        "/api/v1/master": {
          target: env.VITE_SCHEMES_API_URL?.replace("/api/v1", ""),
          changeOrigin: true,
        },

        "/api/v1/reports": {
          target: env.VITE_SCHEMES_API_URL?.replace("/api/v1", ""),
          changeOrigin: true,
        },

        "/api/v1/attendance": {
          target: env.VITE_6A_API_URL?.replace("/api/v1", ""),
          changeOrigin: true,
        },

        "/api/v1/accreditation": {
          target: env.VITE_6A_API_URL?.replace("/api/v1", ""),
          changeOrigin: true,
        },

        "/api/v1": {
          target: env.VITE_PORTAL_API_URL?.replace("/api/v1", ""),
          changeOrigin: true,
        },
      },
    },
  };
});
