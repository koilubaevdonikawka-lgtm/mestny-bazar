import { isNativePlatform } from "../platform";
import type { DeepLinkCapability } from "../types";

/**
 * Deep links only fire through the native OS intent/universal-link system —
 * there is no meaningful web equivalent (a normal URL visit already reaches
 * the router directly). `@capacitor/app` is already a runtime dependency
 * (Splash Screen / Theme Color), so this wires the real plugin rather than a
 * stub, but the import is dynamic and gated behind `isNativePlatform()`
 * (a plain `window.Capacitor` read, no package import — see platform.ts) so
 * it never executes during SSR or on web.
 */
export const nativeDeepLinks: DeepLinkCapability = {
  isSupported: () => isNativePlatform(),

  addListener: (handler) => {
    if (!isNativePlatform()) return () => {};

    let cancelled = false;
    let removeListener: (() => void) | null = null;

    void import("@capacitor/app").then(({ App }) => {
      if (cancelled) return;
      void App.addListener("appUrlOpen", (data) => handler(data.url)).then((listener) => {
        if (cancelled) {
          void listener.remove();
        } else {
          removeListener = () => void listener.remove();
        }
      });
    });

    return () => {
      cancelled = true;
      removeListener?.();
    };
  },
};
