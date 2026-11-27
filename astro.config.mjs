// @ts-check
import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// La URL pública vive en el contenido, no aquí: src/content/site.config.json
const site = JSON.parse(
  readFileSync(new URL("./src/content/site.config.json", import.meta.url), "utf8"),
);

export default defineConfig({
  site: site.url,
  trailingSlash: "ignore",
  // Las demos llevan noindex: no van al sitemap
  integrations: [
    react(),
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/demo/") }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
