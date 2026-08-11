import { useEffect } from "react";

/**
 * Registers the static-asset service worker (public/sw.js) once on mount.
 * Client-only, best-effort — a failed/unsupported registration must never
 * break the app (this is a performance/PWA-installability enhancement, not
 * a requirement for the app to function; the app is always network-driven).
 */
export function useServiceWorkerRegistration(): void {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-critical — the app works fully without the service worker.
      });
    });
  }, []);
}
