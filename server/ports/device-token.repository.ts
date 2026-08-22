import type { DevicePlatform } from "@shared/contracts/push";

export interface IDeviceTokenRepository {
  upsert(userId: string, token: string, platform: DevicePlatform): Promise<void>;
}
