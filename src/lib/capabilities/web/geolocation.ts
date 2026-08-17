import type { GeolocationCapability } from "../types";

/**
 * The browser Geolocation API works identically inside a Capacitor WebView,
 * so no native plugin is needed for this capability today.
 */
export const webGeolocation: GeolocationCapability = {
  isSupported: () => typeof navigator !== "undefined" && "geolocation" in navigator,

  getCurrentPosition: () =>
    new Promise((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        reject(new Error("Geolocation is not supported on this device."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy ?? null,
          }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    }),
};
