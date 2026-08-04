import type { BootstrapStatusDTO } from "@shared/contracts/bootstrap";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

/**
 * Public status check — deliberately requires NO authentication. Knowing whether
 * Bootstrap is still open is not sensitive (it leaks no user data), and the
 * caller needs this answer to decide whether to even show a sign-in prompt in
 * the first place (docs/architecture/BOOTSTRAP_EXECUTION_FLOW_ARCHITECTURE.md §2).
 */
export async function executeGetBootstrapStatus(): Promise<BootstrapStatusDTO> {
  const eligibility = await getServices().bootstrapService.getEligibility();
  return { eligibility };
}

/**
 * Claiming Root Owner status must be attributed to a real, authenticated identity
 * — never anonymous (docs/architecture/PLATFORM_OWNERSHIP_ARCHITECTURE.md §10) —
 * so this is the one Bootstrap operation that requires requireUserIdFromRequest().
 * No role check beyond "authenticated" — Bootstrap does not go through
 * PermissionPolicyService (PLATFORM_OWNERSHIP_ARCHITECTURE.md §3), and no role
 * is even meaningful before a Root Owner exists.
 */
export async function executeClaimBootstrap(): Promise<BootstrapStatusDTO> {
  const userId = await requireUserIdFromRequest();
  await getServices().bootstrapService.claim(userId);
  const eligibility = await getServices().bootstrapService.getEligibility();
  return { eligibility };
}
