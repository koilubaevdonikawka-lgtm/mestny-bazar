import { useEffect, useRef } from "react";
import { isNativePlatform } from "@/lib/capabilities/platform";

/**
 * Wires the actual foreground-detection listeners (Page Visibility API +,
 * on native platforms only, the Capacitor App plugin). Separated from the
 * hook below so it's directly unit-testable in plain Node — this project
 * has no jsdom/@testing-library/react in its test setup, and adding one
 * is outside this task's scope (Rule_002). Returns a cleanup function.
 *
 * `visibilitychange` only ever fires on an actual state transition (never
 * redundantly for the same state), so checking `document.visibilityState
 * === "visible"` at the moment it fires already means exactly "this
 * transition was hidden → visible" — no extra previous-state tracking
 * needed. Same reasoning applies to Capacitor's `appStateChange`: it only
 * fires on transitions, so `isActive === true` alone identifies a
 * background → foreground transition.
 */
export function setupForegroundListener(onForeground: () => void): () => void {
  // SSR-safe: `document` doesn't exist on the server. No-op cleanup, no
  // isNativePlatform() call, no @capacitor/app import — nothing to tear down.
  if (typeof document === "undefined") return () => {};

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") onForeground();
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  let cancelled = false;
  let nativeHandle: { remove: () => Promise<void> } | undefined;

  if (isNativePlatform()) {
    // Dynamic import only, never at module top level — @capacitor/app's
    // registerPlugin() call at import time would be unsafe during SSR,
    // mirroring the existing pattern in src/lib/capabilities/platform.ts.
    import("@capacitor/app")
      .then(({ App }) =>
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) onForeground();
        }),
      )
      .then((handle) => {
        // The effect may have already unmounted by the time this resolves —
        // don't leak a listener registered after cleanup already ran.
        if (cancelled) void handle.remove();
        else nativeHandle = handle;
      })
      .catch(() => {
        // @capacitor/app unavailable (shouldn't happen when
        // isNativePlatform() is true, but never throw/log for this) —
        // Page Visibility above still covers the web/PWA case regardless.
      });
  }

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    cancelled = true;
    void nativeHandle?.remove();
  };
}

/**
 * Calls `onForeground` exactly when the app transitions from background to
 * active — covers web/PWA (Page Visibility API) and, additionally on native
 * platforms, the Capacitor App plugin's `appStateChange` event.
 */
export function useResetOnAppForeground(onForeground: () => void): void {
  const callbackRef = useRef(onForeground);
  callbackRef.current = onForeground;

  useEffect(() => setupForegroundListener(() => callbackRef.current()), []);
}
