import type { RegisterDeviceTokenRequest } from "@shared/contracts/push";
import { registerDeviceTokenFn } from "@/api/push.functions";

export async function registerDeviceToken(data: RegisterDeviceTokenRequest): Promise<void> {
  await registerDeviceTokenFn({ data });
}
