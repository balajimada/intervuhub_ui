// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Turn off the Nitro/SSR execution engine entirely
  tanstackStart: false, 
  
  // Directly pass standard Vite single-page application instructions
  vite: {
    build: {
      ssr: false, // Ensure SSR bundling processes are completely killed
      outDir: "dist", // Outputs standard frontend web files to 'dist'
    },
    resolve: {
      // Resolves the warning message emitted by the bundler
      tsconfigPaths: true 
    }
  }
});
