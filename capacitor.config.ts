import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Wraps the existing, already-deployed TanStack Start SSR app (Cloudflare
 * Workers, mesnyibazar.com) in a native WebView shell — deliberately NOT a
 * bundled static build. The customer app depends on live `createServerFn`
 * server-function calls on nearly every page (catalog, cart, orders,
 * addresses — see src/api/*.functions.ts), so there is no static snapshot
 * that would be safe/correct to ship inside the native binary; `server.url`
 * is the standard, supported Capacitor pattern for wrapping a live,
 * request-time-rendered web app without a parallel static/offline build.
 * This keeps the single-codebase requirement exactly: Android/iOS/Web all
 * run the identical deployed frontend and backend.
 *
 * `webDir` is required by the Capacitor CLI even in remote-URL mode (it's
 * where `cap sync` looks for local fallback assets/splash resources) — it
 * points at the existing Vite/Nitro client build output, never a separate
 * mobile-only bundle.
 */
const config: CapacitorConfig = {
  appId: "com.mesnyibazar.app",
  appName: "Местный Базар",
  webDir: ".output/public",
  server: {
    url: "https://mesnyibazar.com",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#f7f3e9",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f7f3e9",
    },
  },
};

export default config;
