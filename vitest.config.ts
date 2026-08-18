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
    // src/hooks/**/*.test.ts only — deliberately narrow, not all of src/.
    // This project's frontend layer has no test coverage at all (no jsdom,
    // no @testing-library/react); adding either is out of scope here, so
    // useResetOnAppForeground.test.ts exercises the hook's setup/teardown
    // logic directly (a plain exported function, no React rendering
    // involved) rather than through renderHook.
    include: ["server/**/*.test.ts", "shared/**/*.test.ts", "src/hooks/**/*.test.ts"],
  },
});
