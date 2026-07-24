import type { IAuthenticationProvider } from "@server/security/authentication";
import { AuthorizationService } from "@server/security/authorization";
import { SecurityContext } from "@server/security/context";
import type { SecurityMiddlewareHandler } from "@server/security/middleware/security-middleware.types";
import { GUEST_ROLE } from "@server/security/roles";

export interface AuthenticationMiddlewareOptions {
  /** When true, unauthenticated callers receive AnonymousIdentity (default). */
  allowAnonymous?: boolean;
}

/** Resolves caller identity via IAuthenticationProvider — no transport coupling. */
export class AuthenticationMiddleware {
  constructor(
    private readonly authenticationProvider: IAuthenticationProvider,
    private readonly authorizationService = new AuthorizationService(),
    private readonly options: AuthenticationMiddlewareOptions = {},
  ) {}

  handle(): SecurityMiddlewareHandler {
    return async (context, next) => {
      const authResult = await this.authenticationProvider.resolve(context);
      const roles = authResult.roles ?? (authResult.identity.type === "anonymous" ? [GUEST_ROLE] : []);
      const extraPermissions = authResult.permissions ?? [];

      const baseSecurity = SecurityContext.create({
        identity: authResult.identity,
        roles: [...roles],
        permissions: [...extraPermissions],
        locale: context.locale,
        requestId: context.requestId,
        correlationId: context.correlationId,
        tenantId: context.tenantId,
      });

      const security = this.authorizationService.buildContext(baseSecurity, roles, extraPermissions);

      const enriched = Object.freeze({
        ...context,
        security,
      });

      return next(enriched);
    };
  }
}
