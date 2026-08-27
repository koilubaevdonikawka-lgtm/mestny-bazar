import type { ProfileDTO, UpdateProfileRequest } from "@shared/contracts/user";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

/** Задача №182 — replaces the dead server/functions/profile.functions.ts stub (never wired to anything). */
export async function executeGetMyProfile(): Promise<ProfileDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().profileService.getById(userId);
}

export async function executeUpdateMyProfile(data: UpdateProfileRequest): Promise<ProfileDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().profileService.update(userId, data);
}
