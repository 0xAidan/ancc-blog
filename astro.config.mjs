import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://shermandavison.com",
  integrations: [
    sitemap({
      filter: (page) => new URL(page).pathname === "/",
    }),
  ],
  redirects: {
    "/tools": "/",
    "/tools/odds-converter": "/",
    "/projects/ditto": "/",
    "/projects/golf-model": "/",
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api/golf": {
          target: "https://golf.ancc.blog",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/golf/, "/api"),
        },
        "/api/ditto": {
          target: "https://ditto.jungle.win",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ditto/, ""),
        },
      },
    },
  },
});
