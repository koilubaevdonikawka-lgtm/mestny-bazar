import type { AccessProfileDTO } from "@shared/contracts/access-profile";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

// Requires authentication (an identity to resolve roles/ownership for) — no
// specific role beyond that, and no PermissionPolicyService involvement, same
// reasoning as Bootstrap/Ownership Transfer (this reads Access + Ownership, it
// does not gate access to either).
export async function executeGetAccessProfile(): Promise<AccessProfileDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().roleResolutionService.resolveAccess(userId);
}
