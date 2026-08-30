import type { PushNotificationCapability, PushPermissionStatus } from "./types";
import { isNativePlatform, getPlatform } from "./platform";
import { registerDeviceToken } from "@/api/push";

/**
 * @capacitor/push-notifications registers its listeners at import time
 * (registerPlugin), so — same reasoning as useAndroidBackButton's
 * import("@capacitor/app") in __root.tsx — the package is only ever loaded
 * dynamically, inside functions that already know they're running native,
 * never at this module's top level (which SSR also evaluates).
 */

let listenersReady: Promise<void> | null = null;

function ensureListeners(): Promise<void> {
  if (!listenersReady) {
    listenersReady = import("@capacitor/push-notifications").then(async ({ PushNotifications }) => {
      await PushNotifications.addListener("registration", (token) => {
        const platform = getPlatform();
        if (platform !== "android" && platform !== "ios") return;
        registerDeviceToken({ token: token.value, platform }).catch((error) => {
          console.error("[push] failed to save device token", error);
        });
      });
      await PushNotifications.addListener("registrationError", (error) => {
        console.error("[push] registration error", error);
      });
    });
  }
  return listenersReady;
}

export const nativePush: PushNotificationCapability = {
  isSupported: () => isNativePlatform(),

  /**
   * Задача №216 — real on-device crash (adb logcat, TECNO CL6/Android 15):
   * FATAL EXCEPTION: CapacitorPlugins, NullPointerException inside
   * Capacitor's own Bridge.getPermissionStates() (reached from
   * PushNotifications.requestPermissions()) killed the whole app process
   * before this promise ever settled. Root cause fixed at the native layer
   * (android/app/proguard-rules.pro — R8 was stripping/mistransforming
   * Capacitor's own core framework classes, unprotected by its bundled
   * consumer proguard rules), confirmed via a real on-device A/B test.
   * try/catch here is defense in depth for genuinely different failure
   * modes this can't structurally prevent — a device with no Google Play
   * Services, register()'s Firebase getToken() rejecting, or any other
   * native/plugin error — so a permission-request tap can never take the
   * whole app down, whatever the cause.
   */
  requestPermission: async (): Promise<PushPermissionStatus> => {
    if (!isNativePlatform()) return "unsupported";

    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      await ensureListeners();

      const status = await PushNotifications.requestPermissions();
      if (status.receive !== "granted") {
        return status.receive === "denied" ? "denied" : "prompt";
      }

      await PushNotifications.register();
      return "granted";
    } catch (error) {
      console.error("[push] requestPermission failed", error);
      return "error";
    }
  },
};
