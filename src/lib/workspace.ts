import type { WorkspaceId } from "@shared/contracts/access-profile";

/**
 * Canonical Workspace → route mapping (docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md
 * §7, §9). Single source of truth — both /workspace's picker and the staff
 * route guards (admin.tsx/courier.tsx/warehouse.tsx/seller.tsx beforeLoad)
 * resolve against this instead of hardcoding paths twice.
 */
export const WORKSPACE_PATH: Record<WorkspaceId, string> = {
  administration: "/admin",
  seller: "/seller/profile",
  courier: "/courier/orders",
  warehouse: "/warehouse/orders",
  customer: "/",
};

/**
 * §7 п.1-2: exactly one applicable Workspace resolves unambiguously to its
 * path; more than one means Platform Access must not guess — send the user
 * to the explicit picker instead.
 */
export function resolveWorkspaceRedirect(workspaces: WorkspaceId[]): string {
  if (workspaces.length === 1) return WORKSPACE_PATH[workspaces[0]];
  return "/workspace";
}
