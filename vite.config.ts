import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Keeps your standard client-routing framework operational
  },
  nitro: {
    // Instructs Nitro to crawl the code at build time and drop a physical index.html into the folder
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  }
});
