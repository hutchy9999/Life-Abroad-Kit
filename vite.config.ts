import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: loadEnv(mode, ".", "APP_").APP_BASE_PATH || "/life-abroad-kit/",
}));
