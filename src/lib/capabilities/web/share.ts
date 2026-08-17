import type { ShareCapability } from "../types";

/**
 * The Web Share API works identically inside a Capacitor WebView on both
 * Android and iOS, so no native plugin is needed for this capability today.
 * Falls back to clipboard copy when unsupported (older desktop browsers).
 */
export const webShare: ShareCapability = {
  isSupported: () => typeof navigator !== "undefined" && "share" in navigator,

  share: async (data) => {
    if (typeof navigator === "undefined") return false;

    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch {
        return false;
      }
    }

    if (navigator.clipboard && data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  },
};
