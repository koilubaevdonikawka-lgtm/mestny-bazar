export class RbacRoleNotFoundError extends Error {
  constructor() {
    super("Role not found");
    this.name = "RbacRoleNotFoundError";
  }
}

export class RbacPermissionNotFoundError extends Error {
  constructor() {
    super("Permission not found");
    this.name = "RbacPermissionNotFoundError";
  }
}

export class RbacValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "RbacValidationError";
  }
}

/** Blocks rename/delete of a seeded is_system=true role (Суперадминистратор etc.). */
export class SystemRoleImmutableError extends Error {
  constructor() {
    super("System roles cannot be renamed or deleted");
    this.name = "SystemRoleImmutableError";
  }
}

/** Blocks delete of a seeded is_system=true permission that live code depends on. */
export class SystemPermissionImmutableError extends Error {
  constructor() {
    super("System permissions cannot be deleted");
    this.name = "SystemPermissionImmutableError";
  }
}
