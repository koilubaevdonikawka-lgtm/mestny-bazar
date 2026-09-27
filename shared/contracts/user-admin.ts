import type { UserRole } from "@shared/contracts/user";

/** admin-finance/admin-marketing (permissions.md) — NOT new UserRole values, a finer scope layered on top of the existing "admin" role. */
export const AdminScope = {
  FINANCE: "finance",
  MARKETING: "marketing",
} as const;

export type AdminScope = (typeof AdminScope)[keyof typeof AdminScope];

export interface AdminUserDTO {
  id: string;
  fullName: string | null;
  phone: string | null;
  roles: UserRole[];
  adminScopes: AdminScope[];
  isBlocked: boolean;
  createdAt: string;
}

export interface AssignRoleRequest {
  userId: string;
  role: UserRole;
}

export interface RevokeRoleRequest {
  userId: string;
  role: UserRole;
}

export interface AssignAdminScopeRequest {
  userId: string;
  scope: AdminScope;
}

export interface RevokeAdminScopeRequest {
  userId: string;
  scope: AdminScope;
}

export interface SetCustomerBlockedRequest {
  userId: string;
  isBlocked: boolean;
}

/**
 * A guest (never signed in) identified only by the phone typed at checkout —
 * aggregated from orders with user_id = NULL. Deliberately NOT an AdminUserDTO:
 * there is no profiles row behind it, so roles/scopes/is_blocked don't apply.
 */
export interface GuestCustomerDTO {
  phone: string;
  firstOrderAt: string;
  lastOrderAt: string;
  ordersCount: number;
}

export interface ListGuestCustomersRequest {
  offset: number;
  limit: number;
}

export interface GuestCustomerPageDTO {
  items: GuestCustomerDTO[];
  /** Unique guest phones found within the scanned window. */
  total: number;
  hasMore: boolean;
  /** True when the scan hit its cap — older guest orders beyond it aren't counted. */
  truncated: boolean;
  scanLimit: number;
}
