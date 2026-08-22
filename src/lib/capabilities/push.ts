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

  requestPermission: async (): Promise<PushPermissionStatus> => {
    if (!isNativePlatform()) return "unsupported";

    const { PushNotifications } = await import("@capacitor/push-notifications");
    await ensureListeners();

    const status = await PushNotifications.requestPermissions();
    if (status.receive !== "granted") {
      return status.receive === "denied" ? "denied" : "prompt";
    }

    await PushNotifications.register();
    return "granted";
  },
};
