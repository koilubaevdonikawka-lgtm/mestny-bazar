import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Deliberately separate from vite.config.ts: the app's Vite config is wrapped by
// @lovable.dev/vite-tanstack-config and pulls in TanStack Start's SSR/build plugins
// (import-protection, nitro, cloudflare target) that have no place in a unit-test
// runner. This config only needs the same tsconfig path aliases (@server/*, @shared/*).
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "shared/**/*.test.ts"],
  },
});
