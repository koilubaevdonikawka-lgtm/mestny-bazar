import { AuthorizationService } from "@server/security/authorization";
import { AuthenticatedIdentity } from "@server/security/identity/authenticated-identity";
import type { Permission } from "@server/security/permissions";
import type { AccessPolicy } from "@server/security/policies";
import type { RoleName } from "@server/security/roles";
import { ForbiddenError, UnauthorizedError } from "@server/security/shared";
import type { SecurityMiddlewareHandler } from "@server/security/middleware/security-middleware.types";

export interface AuthorizationMiddlewareOptions {
  readonly requiredRoles?: readonly RoleName[];
  readonly requiredPermissions?: readonly Permission[];
  readonly policy?: AccessPolicy;
  readonly requireAuthenticated?: boolean;
}

/** Enforces role, permission, or policy constraints on the secure pipeline. */
export class AuthorizationMiddleware {
  constructor(
    private readonly options: AuthorizationMiddlewareOptions,
    private readonly authorizationService = new AuthorizationService(),
  ) {}

  handle(): SecurityMiddlewareHandler {
    return async (context, next) => {
      const { security } = context;

      if (this.options.requireAuthenticated && !(security.identity instanceof AuthenticatedIdentity)) {
        throw new UnauthorizedError();
      }

      if (this.options.requiredRoles?.length) {
        this.authorizationService.requireAnyRole(security, this.options.requiredRoles);
      }

      if (this.options.requiredPermissions?.length) {
        this.authorizationService.requireAllPermissions(security, this.options.requiredPermissions);
      }

      if (this.options.policy) {
        try {
          this.authorizationService.authorize(this.options.policy, {
            context: security,
            action: `${context.method} ${context.path}`,
            metadata: Object.freeze({ params: context.params, query: context.query }),
          });
        } catch (error) {
          if (error instanceof ForbiddenError) {
            throw error;
          }
          throw new ForbiddenError();
        }
      }

      return next(context);
    };
  }
}

/** Factory for route-scoped authorization middleware. */
export function requirePermissions(
  permissions: readonly Permission[],
): AuthorizationMiddleware {
  return new AuthorizationMiddleware({ requiredPermissions: permissions });
}

/** Factory for route-scoped role checks. */
export function requireRoles(roles: readonly RoleName[]): AuthorizationMiddleware {
  return new AuthorizationMiddleware({ requiredRoles: roles });
}

/** Factory for authenticated-only routes. */
export function requireAuthenticated(): AuthorizationMiddleware {
  return new AuthorizationMiddleware({ requireAuthenticated: true });
}
