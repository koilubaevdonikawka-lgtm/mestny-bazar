import type { ProfileDTO, UpdateProfileRequest } from "@shared/contracts/user";

export interface IProfileRepository {
  /** null only if the profiles row genuinely doesn't exist (shouldn't happen — the
   * on_auth_user_created trigger inserts one for every signed-up user), never a
   * stand-in for "not authenticated" (the caller already resolved userId from the JWT). */
  getById(userId: string): Promise<ProfileDTO | null>;
  update(userId: string, data: UpdateProfileRequest): Promise<ProfileDTO>;
}
