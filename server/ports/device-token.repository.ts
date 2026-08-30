import type { DevicePlatform } from "@shared/contracts/push";

export interface DeviceTokenDTO {
  token: string;
  platform: DevicePlatform;
}

export interface IDeviceTokenRepository {
  upsert(userId: string, token: string, platform: DevicePlatform): Promise<void>;
  /** Задача №215 — FcmPushAdapter resolves every device a user is signed into before sending. */
  listByUserId(userId: string): Promise<DeviceTokenDTO[]>;
  /** Задача №215 — FCM returned UNREGISTERED/INVALID_ARGUMENT for this token; it no longer exists on the device, remove it so future sends don't keep retrying it. */
  deleteByToken(token: string): Promise<void>;
  /** Задача №218 — every distinct user with at least one registered device, platform-wide (not scoped to one user like listByUserId) — the raw candidate list for a broadcast, before PushBroadcastService excludes staff accounts. */
  listDistinctUserIds(): Promise<string[]>;
}
