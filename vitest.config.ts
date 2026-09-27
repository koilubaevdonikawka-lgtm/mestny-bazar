import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Deliberately separate from vite.config.ts: the app's Vite config pulls in
// TanStack Start's SSR/build plugins (import-protection, nitro, cloudflare
// target) that have no place in a unit-test runner. This config only needs
// the same tsconfig path aliases (@server/*, @shared/*).
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    // src/hooks/**/*.test.ts and src/lib/**/*.test.ts only — deliberately
    // narrow, not all of src/. This project's frontend layer has no test
    // coverage at all (no jsdom, no @testing-library/react); adding either
    // is out of scope here, so useResetOnAppForeground.test.ts and
    // image-compression.test.ts each exercise a plain exported function
    // directly (no React rendering, no Canvas/createImageBitmap — Node has
    // no browser Canvas implementation, so image-compression.test.ts only
    // covers the size-based skip branch that runs before any Canvas call;
    // the actual resize/re-encode path is verified in a real browser, see
    // Задача №239's report).
    include: [
      "server/**/*.test.ts",
      "shared/**/*.test.ts",
      "src/hooks/**/*.test.ts",
      "src/lib/**/*.test.ts",
      "src/stores/**/*.test.ts",
    ],
  },
});
