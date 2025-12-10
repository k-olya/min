import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: "build",
  },
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});
