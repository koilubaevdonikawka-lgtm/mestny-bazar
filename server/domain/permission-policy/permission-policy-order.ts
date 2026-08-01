/** Named execution order for permission policy rules (ascending). */
export const PermissionPolicyOrder = {
  GLOBAL_GUARD: 10,
  /** Runs before ADMIN_FULL_ACCESS — only applies to admins who carry a scope (admin-finance/admin-marketing), narrowing them before the unrestricted grant ever runs. */
  ADMIN_SCOPE_RESTRICTION: 15,
  ADMIN_FULL_ACCESS: 20,
  /** Reserved for future per-role scoping rules (warehouse/seller — see docs/admin-platform/permissions.md). */
  ROLE_SCOPE: 40,
} as const;
