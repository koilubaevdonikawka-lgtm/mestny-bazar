import type { UserRole } from "@shared/contracts/user";

/** One canonical Workspace per (docs/architecture/PLATFORM_ACCESS_ARCHITECTURE.md §9) — "customer" is always available, the rest depend on the resolved roles below. */
export type WorkspaceId = "customer" | "seller" | "courier" | "warehouse" | "administration";

/**
 * Result of Role Resolution — the full set of Access-roles (user_roles) plus the
 * Platform Ownership status (Root Owner / Owner), read independently and combined
 * here (PLATFORM_ACCESS_ARCHITECTURE.md §6, §9). ownershipRole is null for anyone
 * who isn't a Root Owner or Owner — this is the normal case for every Access-role
 * holder (Administrator, Seller, Courier, Warehouse, Customer).
 */
export interface AccessProfileDTO {
  accessRoles: UserRole[];
  ownershipRole: "ROOT_OWNER" | "OWNER" | null;
  workspaces: WorkspaceId[];
}
