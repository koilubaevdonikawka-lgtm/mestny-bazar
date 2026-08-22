import type { RegisterDeviceTokenRequest } from "@shared/contracts/push";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeRegisterDeviceToken(data: RegisterDeviceTokenRequest): Promise<void> {
  const userId = await requireUserIdFromRequest();
  await getServices().deviceTokenService.registerToken(userId, data.token, data.platform);
}
