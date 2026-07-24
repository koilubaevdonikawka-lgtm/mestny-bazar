/** Metadata describing a permission within the platform catalog. */
export interface PermissionDefinition {
  readonly key: string;
  readonly resource: string;
  readonly action: string;
  readonly description?: string;
}

/** Branded permission key — extensible beyond the core catalog. */
export type Permission = string & { readonly __permissionBrand?: unique symbol };

/** Creates a typed permission key from a string literal. */
export function permissionKey<T extends string>(key: T): Permission & T {
  return key as Permission & T;
}

/** Core marketplace permissions shipped with the platform. */
export const CorePermissions = Object.freeze({
  product: Object.freeze({
    create: permissionKey("product.create"),
    update: permissionKey("product.update"),
    delete: permissionKey("product.delete"),
  }),
  catalog: Object.freeze({
    manage: permissionKey("catalog.manage"),
  }),
  seller: Object.freeze({
    verify: permissionKey("seller.verify"),
    block: permissionKey("seller.block"),
  }),
  order: Object.freeze({
    create: permissionKey("order.create"),
    cancel: permissionKey("order.cancel"),
    refund: permissionKey("order.refund"),
  }),
  user: Object.freeze({
    manage: permissionKey("user.manage"),
  }),
  audit: Object.freeze({
    view: permissionKey("audit.view"),
  }),
  permissions: Object.freeze({
    manage: permissionKey("permissions.manage"),
  }),
});

export type CorePermission =
  | typeof CorePermissions.product.create
  | typeof CorePermissions.product.update
  | typeof CorePermissions.product.delete
  | typeof CorePermissions.catalog.manage
  | typeof CorePermissions.seller.verify
  | typeof CorePermissions.seller.block
  | typeof CorePermissions.order.create
  | typeof CorePermissions.order.cancel
  | typeof CorePermissions.order.refund
  | typeof CorePermissions.user.manage
  | typeof CorePermissions.audit.view
  | typeof CorePermissions.permissions.manage;

/** Default permission catalog definitions — extendable at runtime. */
export const CorePermissionDefinitions: readonly PermissionDefinition[] = Object.freeze([
  { key: "product.create", resource: "product", action: "create", description: "Create products" },
  { key: "product.update", resource: "product", action: "update", description: "Update products" },
  { key: "product.delete", resource: "product", action: "delete", description: "Delete products" },
  { key: "catalog.manage", resource: "catalog", action: "manage", description: "Manage catalog structure" },
  { key: "seller.verify", resource: "seller", action: "verify", description: "Verify sellers" },
  { key: "seller.block", resource: "seller", action: "block", description: "Block sellers" },
  { key: "order.create", resource: "order", action: "create", description: "Create orders" },
  { key: "order.cancel", resource: "order", action: "cancel", description: "Cancel orders" },
  { key: "order.refund", resource: "order", action: "refund", description: "Refund orders" },
  { key: "user.manage", resource: "user", action: "manage", description: "Manage users" },
  { key: "audit.view", resource: "audit", action: "view", description: "View audit logs" },
  {
    key: "permissions.manage",
    resource: "permissions",
    action: "manage",
    description: "Manage permission assignments",
  },
]);

/** Runtime registry for core and custom permissions. */
export class PermissionRegistry {
  private readonly definitions = new Map<string, PermissionDefinition>();

  constructor(seed: readonly PermissionDefinition[] = CorePermissionDefinitions) {
    for (const definition of seed) {
      this.definitions.set(definition.key, Object.freeze({ ...definition }));
    }
    Object.freeze(this);
  }

  register(definition: PermissionDefinition): PermissionRegistry {
    if (this.definitions.has(definition.key)) {
      throw new Error(`Permission already registered: ${definition.key}`);
    }

    const next = new Map(this.definitions);
    next.set(definition.key, Object.freeze({ ...definition }));
    return new PermissionRegistry([...next.values()]);
  }

  has(key: string): boolean {
    return this.definitions.has(key);
  }

  get(key: string): PermissionDefinition | undefined {
    return this.definitions.get(key);
  }

  list(): readonly PermissionDefinition[] {
    return Object.freeze([...this.definitions.values()]);
  }
}

/** Shared default permission registry instance. */
export const DefaultPermissionRegistry = new PermissionRegistry();
