import type { PushNotificationCapability } from "./types";

/**
 * Not implemented — requires a native plugin (@capacitor/push-notifications)
 * plus a server-side sender (APNs/FCM credentials, a device-token store, a
 * `notifications.send` domain service), all explicitly out of scope for this
 * pass (Prompt №071 item 6: architecture only). Kept as an honest
 * "unsupported" stub, matching the `PushNotificationCapability` interface,
 * so call sites can be written against the final shape today and only need
 * the factory in index.ts repointed once the real plugin is added.
 */
export const unsupportedPush: PushNotificationCapability = {
  isSupported: () => false,
  requestPermission: async () => "unsupported",
};
