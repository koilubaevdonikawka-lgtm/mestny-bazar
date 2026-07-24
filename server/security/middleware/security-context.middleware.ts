import { SecurityContext } from "@server/security/context";
import type { SecurityMiddlewareHandler } from "@server/security/middleware/security-middleware.types";
import { readHeader } from "@server/security/middleware/security-middleware.types";

/** Builds the base SecurityContext from transport-agnostic request metadata. */
export class SecurityContextMiddleware {
  handle(): SecurityMiddlewareHandler {
    return async (context, next) => {
      const requestId = context.requestId ?? readHeader(context.headers, "x-request-id");
      const correlationId =
        context.correlationId ?? readHeader(context.headers, "x-correlation-id") ?? requestId;
      const locale =
        context.locale ??
        readHeader(context.headers, "accept-language")?.split(",")[0]?.trim() ??
        "ru-KG";
      const tenantId = context.tenantId ?? readHeader(context.headers, "x-tenant-id");

      const security = SecurityContext.anonymous(requestId, correlationId);

      const enriched = Object.freeze({
        ...context,
        requestId,
        correlationId,
        locale,
        tenantId,
        security: SecurityContext.create({
          identity: security.identity,
          roles: [...security.roles],
          permissions: [...security.permissions],
          locale,
          requestId,
          correlationId,
          tenantId,
        }),
      });

      return next(enriched);
    };
  }
}
