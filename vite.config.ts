// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Zoho Catalyst Slate hosts static assets, so ship a client-rendered SPA shell
  // instead of a Nitro/SSR server bundle.
  nitro: false,
  vite: {
    // TanStack's prerender step starts Vite preview; bind IPv4 for build
    // environments that do not support the default IPv6 wildcard address.
    preview: { host: "127.0.0.1" },
  },
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: { outputPath: "/index.html" },
    },
  },
});
