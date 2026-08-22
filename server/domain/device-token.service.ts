import type { DevicePlatform } from "@shared/contracts/push";
import type { IDeviceTokenRepository } from "@server/ports/device-token.repository";

export class DeviceTokenService {
  constructor(private readonly deviceTokens: IDeviceTokenRepository) {}

  async registerToken(userId: string, token: string, platform: DevicePlatform): Promise<void> {
    await this.deviceTokens.upsert(userId, token, platform);
  }
}
