import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    proxy: {
      "/api/golf": {
        target: "https://golf.ancc.blog",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/golf/, "/api"),
      },
    },
  },
});
