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
