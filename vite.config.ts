import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const portalTarget = (
    env.VITE_PORTAL_API_URL || "http://localhost:8091"
  ).replace(/\/+$/, "");
  const sixATarget = (env.VITE_6A_API_URL || "http://localhost:8083").replace(
    /\/+$/,
    "",
  );
  const schemesTarget = (
    env.VITE_SCHEMES_API_URL || "http://localhost:8082"
  ).replace(/\/+$/, "");

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
          target: schemesTarget,
          changeOrigin: true,
        },
        "/api/v1/master": {
          target: schemesTarget,
          changeOrigin: true,
        },
        "/api/v1/reports": {
          target: schemesTarget,
          changeOrigin: true,
        },
        "/api/v1/attendance": {
          target: sixATarget,
          changeOrigin: true,
        },
        "/api/v1/accreditation": {
          target: sixATarget,
          changeOrigin: true,
        },
        "/api/v1": {
          target: portalTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
