/** Canonical role identifiers for the marketplace platform. */
export const Role = {
  Administrator: "administrator",
  Seller: "seller",
  Customer: "customer",
  Courier: "courier",
  Warehouse: "warehouse",
  Support: "support",
  Guest: "guest",
  System: "system",
} as const;

export type RoleName = (typeof Role)[keyof typeof Role];

/** Immutable role assignment bound to a security principal. */
export interface RoleAssignment {
  readonly name: RoleName;
  readonly assignedAt: string;
  readonly source?: string;
}

/** Validates whether a string is a known platform role. */
export function isRoleName(value: string): value is RoleName {
  return Object.values(Role).includes(value as RoleName);
}

/** Normalizes and validates a role name. */
export function parseRoleName(raw: string): RoleName {
  const normalized = raw?.trim().toLowerCase();
  if (!normalized || !isRoleName(normalized)) {
    throw new Error(`Unknown role: ${raw}`);
  }
  return normalized;
}

/** Creates a frozen role assignment value. */
export function createRoleAssignment(
  name: RoleName,
  assignedAt: string,
  source?: string,
): RoleAssignment {
  return Object.freeze({
    name,
    assignedAt,
    source: source?.trim() || undefined,
  });
}

/** Default role granted to anonymous callers. */
export const GUEST_ROLE: RoleAssignment = Object.freeze({
  name: Role.Guest,
  assignedAt: "0001-01-01T00:00:00.000Z",
  source: "default",
});

/** Default role for internal system actors. */
export const SYSTEM_ROLE: RoleAssignment = Object.freeze({
  name: Role.System,
  assignedAt: "0001-01-01T00:00:00.000Z",
  source: "default",
});

/** Maps each role to its default permission set (extensible via registry). */
export const RolePermissionMatrix: Readonly<Record<RoleName, readonly string[]>> = Object.freeze({
  [Role.Administrator]: Object.freeze([
    "product.create",
    "product.update",
    "product.delete",
    "catalog.manage",
    "seller.verify",
    "seller.block",
    "order.create",
    "order.cancel",
    "order.refund",
    "user.manage",
    "audit.view",
    "permissions.manage",
  ]),
  [Role.Seller]: Object.freeze([
    "product.create",
    "product.update",
    "product.delete",
    "order.create",
  ]),
  [Role.Customer]: Object.freeze(["order.create", "order.cancel"]),
  [Role.Courier]: Object.freeze([]),
  [Role.Warehouse]: Object.freeze([]),
  [Role.Support]: Object.freeze(["audit.view"]),
  [Role.Guest]: Object.freeze([]),
  [Role.System]: Object.freeze([
    "product.create",
    "product.update",
    "product.delete",
    "catalog.manage",
    "seller.verify",
    "seller.block",
    "order.create",
    "order.cancel",
    "order.refund",
    "user.manage",
    "audit.view",
    "permissions.manage",
  ]),
});
