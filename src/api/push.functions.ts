import { createServerFn } from "@tanstack/react-start";
import { registerDeviceTokenRequestSchema } from "@shared/validation/push.schema";

export const registerDeviceTokenFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => registerDeviceTokenRequestSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { executeRegisterDeviceToken } = await import("@server/functions/device-token.executor");
    await executeRegisterDeviceToken(data);
    return { ok: true };
  });
