import type { DeleteMyAccountResult } from "@shared/contracts/account-deletion";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

// The account to delete is always the caller's own, resolved from the verified
// session JWT — the request carries no user id at all, so another account can
// never be targeted.
export async function executeDeleteMyAccount(): Promise<DeleteMyAccountResult> {
  const userId = await requireUserIdFromRequest();
  return getServices().accountDeletionService.deleteOwnAccount(userId);
}
