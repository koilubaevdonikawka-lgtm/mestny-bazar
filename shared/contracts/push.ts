export type DevicePlatform = "android" | "ios";

export interface RegisterDeviceTokenRequest {
  token: string;
  platform: DevicePlatform;
}
