import type { UserRole } from "@shared/contracts/user";
import type { AccessProfileDTO, WorkspaceId } from "@shared/contracts/access-profile";
import { resolveRolesForUser } from "@server/auth/resolve-user";
import type { PlatformOwnershipService } from "@server/domain/platform-ownership.service";

/**
 * Which Workspace(s) a given set of Access-roles + Ownership status resolve to
 * (docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md §7, §9). Root Owner/Owner do
 * not have a Workspace of their own — they act inside Administration Workspace,
 * same as Administrator (§7 п.3). Customer is always included: it's the one
 * role every account has (auto-granted at signup) and the fallback when nothing
 * else applies (§7 п.4).
 */
export function resolveWorkspaces(
  accessRoles: UserRole[],
  ownershipRole: "ROOT_OWNER" | "OWNER" | null,
): WorkspaceId[] {
  const workspaces: WorkspaceId[] = [];

  if (accessRoles.includes("admin") || ownershipRole !== null) {
    workspaces.push("administration");
  }
  if (accessRoles.includes("seller")) workspaces.push("seller");
  if (accessRoles.includes("courier")) workspaces.push("courier");
  if (accessRoles.includes("warehouse")) workspaces.push("warehouse");

  // Always available — the base fallback (§7 п.4), and every account already
  // holds the "customer" Access-role from signup regardless of what else applies.
  workspaces.push("customer");

  return workspaces;
}

/**
 * Platform Access — Role Resolution (docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md
 * §6). Combines two already-existing, independently-checked sources — never
 * merges or duplicates their storage: Access-roles via resolveRolesForUser()
 * (server/auth/resolve-user.ts, unchanged) and Ownership via
 * PlatformOwnershipService.getByUserId() (unchanged, Этап 1). Does not depend on
 * Bootstrap or touch Ownership Transfer — this is a read-only composition, not a
 * new source of truth.
 */
export class RoleResolutionService {
  constructor(private readonly platformOwnership: PlatformOwnershipService) {}

  async resolveAccess(userId: string): Promise<AccessProfileDTO> {
    const [accessRoles, ownershipRecord] = await Promise.all([
      resolveRolesForUser(userId),
      this.platformOwnership.getByUserId(userId),
    ]);

    const ownershipRole = ownershipRecord?.role ?? null;

    return {
      accessRoles,
      ownershipRole,
      workspaces: resolveWorkspaces(accessRoles, ownershipRole),
    };
  }
}
