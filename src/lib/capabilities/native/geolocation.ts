import type { GeolocationCapability } from "../types";

/**
 * Задача №166 — official @capacitor/geolocation plugin. Задача №165's
 * diagnosis: a Capacitor Android WebView does not forward a bare
 * navigator.geolocation call (../web/geolocation.ts) to the system
 * permission dialog on its own — no permissions were even declared in
 * AndroidManifest.xml, and MainActivity.java had no WebChromeClient
 * override to bridge one. This plugin owns that native bridging itself
 * (checkPermissions/requestPermissions/getCurrentPosition all talk to the
 * real Android permission system directly), so no MainActivity.java change
 * is needed — only the manifest permissions (added separately) and this
 * capability implementation.
 *
 * @capacitor/geolocation registers itself at import time (registerPlugin),
 * so — same reasoning as nativePush/nativeDeepLinks in this same directory
 * tree — it's only ever imported dynamically inside this function, never at
 * this module's top level (which SSR also evaluates). getGeolocationCapability()
 * in ../index.ts only ever returns this implementation when isNativePlatform()
 * is already true, so in practice these dynamic imports only run on a real
 * device — but keeping the import itself dynamic here too means this module
 * stays safe to import from anywhere, matching every other native/*.ts file.
 */
export const nativeGeolocation: GeolocationCapability = {
  isSupported: () => true,

  getCurrentPosition: async () => {
    const { Geolocation } = await import("@capacitor/geolocation");

    let status = await Geolocation.checkPermissions();
    if (status.location !== "granted") {
      status = await Geolocation.requestPermissions();
    }
    if (status.location !== "granted") {
      throw new Error("Geolocation permission was denied.");
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10_000,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyMeters: position.coords.accuracy ?? null,
    };
  },
};
