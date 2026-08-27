import { createServerFn } from "@tanstack/react-start";
import type { ProfileDTO } from "@shared/contracts/user";
import { updateProfileRequestSchema } from "@shared/validation/profile.schema";

export const getMyProfileFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProfileDTO> => {
    const { executeGetMyProfile } = await import("@server/functions/profile.executor");
    return executeGetMyProfile();
  },
);

export const updateMyProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateProfileRequestSchema.parse(data))
  .handler(async ({ data }): Promise<ProfileDTO> => {
    const { executeUpdateMyProfile } = await import("@server/functions/profile.executor");
    return executeUpdateMyProfile(data);
  });
