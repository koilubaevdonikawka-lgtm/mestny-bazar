/**
 * Interface-only contracts for native-device capabilities (Prompt №071 item
 * 6: "подготовить архитектуру", not full implementations). Each capability
 * has one runtime implementation today (Web API where genuinely functional,
 * an unsupported stub where it isn't) selected by src/lib/capabilities/index.ts.
 * Swapping a stub for a real @capacitor/* plugin later means adding one
 * native/*.ts file and updating its factory function — call sites never change.
 */

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
}

export interface GeolocationCapability {
  isSupported(): boolean;
  getCurrentPosition(): Promise<GeoPosition>;
}

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareCapability {
  isSupported(): boolean;
  /** Returns true if the share (or fallback) succeeded, false if unavailable/cancelled. */
  share(data: ShareData): Promise<boolean>;
}

export interface CapturedImage {
  dataUrl: string;
  mimeType: string;
}

export interface CameraCapability {
  isSupported(): boolean;
  capturePhoto(): Promise<CapturedImage | null>;
}

export interface GalleryCapability {
  isSupported(): boolean;
  pickImage(): Promise<CapturedImage | null>;
}

export type DeepLinkHandler = (url: string) => void;

export interface DeepLinkCapability {
  isSupported(): boolean;
  /** Returns an unsubscribe function. No-op on unsupported platforms. */
  addListener(handler: DeepLinkHandler): () => void;
}

export type PushPermissionStatus = "granted" | "denied" | "prompt" | "unsupported";

export interface PushNotificationCapability {
  isSupported(): boolean;
  requestPermission(): Promise<PushPermissionStatus>;
}
