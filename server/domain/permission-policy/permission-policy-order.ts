/** Named execution order for permission policy rules (ascending). */
export const PermissionPolicyOrder = {
  GLOBAL_GUARD: 10,
  ADMIN_FULL_ACCESS: 20,
  /** Reserved for future per-role/sub-role scoping rules (Stage 3, see docs/admin-platform/permissions.md). */
  ROLE_SCOPE: 40,
} as const;
