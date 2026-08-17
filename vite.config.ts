import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode, command }) => {
  // VITE_* vars need to land in import.meta.env for both dev and build (Vite
  // only does this automatically for client code, not the SSR/server bundle).
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  );

  return {
    define: envDefine,
    // Vite uses PostCSS in dev and Lightning CSS at build by default; forcing
    // lightningcss in both keeps dev preview and built output consistent.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: { host: "::", port: 8080, strictPort: true },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        server: { entry: "server" },
      }),
      // Build-only: generates the Cloudflare Workers-compatible output in .output/.
      ...(command === "build"
        ? [
            nitro({
              defaultPreset: "cloudflare-module",
              // Payment expiry sweep (tasks/payment/sweep-expired.ts) — the
              // cloudflare-module preset has native Cron Trigger support;
              // Nitro generates the trigger in the built wrangler config at
              // build time, no hand-maintained wrangler.toml needed.
              experimental: { tasks: true },
              // Explicit handler registration, not file-based tasks/ scanning
              // — this project's scanDirs (set by the TanStack Start Nitro
              // integration) don't include the plain project-root tasks/
              // directory a vanilla Nitro app would scan, so auto-discovery
              // silently found nothing (verified: build succeeded and wrote
              // the cron trigger to wrangler.json, but the task handler's
              // own code never appeared anywhere in .output/server/). A
              // relative "./tasks/..." handler path also failed — Nitro's
              // virtual tasks module resolves it from a base other than this
              // file's directory — so this uses an absolute path instead.
              tasks: {
                "payment:sweep-expired": {
                  handler: fileURLToPath(
                    new URL("./tasks/payment/sweep-expired.ts", import.meta.url),
                  ),
                },
              },
              scheduledTasks: { "*/5 * * * *": "payment:sweep-expired" },
              cloudflare: { deployConfig: true },
            }),
          ]
        : []),
      viteReact(),
    ],
  };
});
