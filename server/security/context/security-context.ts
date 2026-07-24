import { AnonymousIdentity } from "@server/security/identity/anonymous-identity";
import type { Identity } from "@server/security/identity";
import type { Permission } from "@server/security/permissions";
import { GUEST_ROLE, type RoleAssignment } from "@server/security/roles";

export interface SecurityContextProps {
  identity: Identity;
  roles?: readonly RoleAssignment[];
  permissions?: readonly Permission[];
  locale?: string;
  requestId?: string;
  correlationId?: string;
  tenantId?: string;
}

/** Immutable security context attached to each secured request. */
export class SecurityContext {
  readonly identity: Identity;
  readonly roles: readonly RoleAssignment[];
  readonly permissions: readonly Permission[];
  readonly locale: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly tenantId?: string;

  private constructor(props: Required<Omit<SecurityContextProps, "locale">> & { locale: string }) {
    this.identity = props.identity;
    this.roles = props.roles;
    this.permissions = props.permissions;
    this.locale = props.locale;
    this.requestId = props.requestId;
    this.correlationId = props.correlationId;
    this.tenantId = props.tenantId;
    Object.freeze(this);
  }

  static create(props: SecurityContextProps): SecurityContext {
    const roles = Object.freeze([...(props.roles ?? [GUEST_ROLE])]);
    const permissions = Object.freeze([...(props.permissions ?? [])]);

    return new SecurityContext({
      identity: props.identity,
      roles,
      permissions,
      locale: props.locale?.trim() || "ru-KG",
      requestId: props.requestId?.trim() || undefined,
      correlationId: props.correlationId?.trim() || undefined,
      tenantId: props.tenantId?.trim() || undefined,
    });
  }

  static anonymous(requestId?: string, correlationId?: string): SecurityContext {
    return SecurityContext.create({
      identity: AnonymousIdentity.create(),
      roles: [GUEST_ROLE],
      permissions: [],
      requestId,
      correlationId,
    });
  }

  hasRole(roleName: string): boolean {
    return this.roles.some((role) => role.name === roleName);
  }

  hasPermission(permission: Permission | string): boolean {
    return this.permissions.includes(permission as Permission);
  }

  withIdentity(identity: Identity): SecurityContext {
    return SecurityContext.create({
      identity,
      roles: [...this.roles],
      permissions: [...this.permissions],
      locale: this.locale,
      requestId: this.requestId,
      correlationId: this.correlationId,
      tenantId: this.tenantId,
    });
  }

  withPermissions(permissions: readonly Permission[]): SecurityContext {
    return SecurityContext.create({
      identity: this.identity,
      roles: [...this.roles],
      permissions: [...permissions],
      locale: this.locale,
      requestId: this.requestId,
      correlationId: this.correlationId,
      tenantId: this.tenantId,
    });
  }
}
