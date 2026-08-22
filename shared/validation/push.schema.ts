import { z } from "zod";

export const registerDeviceTokenRequestSchema = z.object({
  token: z.string().trim().min(1).max(500),
  platform: z.enum(["android", "ios"]),
});
