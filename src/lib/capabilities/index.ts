/**
 * Single entry point for device-capability access. Every getter returns the
 * best implementation available today; when a real native plugin is added
 * later, only the getter body changes (e.g. branch on isNativePlatform() to
 * return a new native/*.ts implementation) — call sites never change since
 * they only depend on the interfaces in ./types.
 */
export { isNativePlatform, getPlatform } from "./platform";
export type { AppPlatform } from "./platform";
export type {
  GeoPosition,
  GeolocationCapability,
  ShareData,
  ShareCapability,
  CapturedImage,
  CameraCapability,
  GalleryCapability,
  DeepLinkHandler,
  DeepLinkCapability,
  PushPermissionStatus,
  PushNotificationCapability,
} from "./types";

import { isNativePlatform } from "./platform";
import { webGeolocation } from "./web/geolocation";
import { nativeGeolocation } from "./native/geolocation";
import { webShare } from "./web/share";
import { webCamera, webGallery } from "./web/image-picker";
import { nativeDeepLinks } from "./native/deep-links";
import { nativePush } from "./push";
import type {
  GeolocationCapability,
  ShareCapability,
  CameraCapability,
  GalleryCapability,
  DeepLinkCapability,
  PushNotificationCapability,
} from "./types";

/** Задача №166 — native/geolocation.ts (the real @capacitor/geolocation plugin) only on a device that actually is one; web keeps the existing browser API unchanged. */
export const getGeolocationCapability = (): GeolocationCapability =>
  isNativePlatform() ? nativeGeolocation : webGeolocation;
export const getShareCapability = (): ShareCapability => webShare;
export const getCameraCapability = (): CameraCapability => webCamera;
export const getGalleryCapability = (): GalleryCapability => webGallery;
export const getDeepLinkCapability = (): DeepLinkCapability => nativeDeepLinks;
export const getPushNotificationCapability = (): PushNotificationCapability => nativePush;
