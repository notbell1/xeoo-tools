import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/php": {
        target: "http://localhost",
        changeOrigin: true,
        secure: false,

        rewrite: (path) =>
          path.replace(/^\/php/, "/PROJECT%20GIT/xeoo_tools/backend"),
      },
    },
  },
});
