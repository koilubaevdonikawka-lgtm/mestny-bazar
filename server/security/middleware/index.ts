export {
  readHeader,
  toSecurePipelineContext,
  type SecurePipelineContext,
  type SecurityMiddlewareHandler,
  type SecurityNextHandler,
} from "./security-middleware.types";
export { SecurityContextMiddleware } from "./security-context.middleware";
export {
  AuthenticationMiddleware,
  type AuthenticationMiddlewareOptions,
} from "./authentication.middleware";
export {
  AuthorizationMiddleware,
  requireAuthenticated,
  requirePermissions,
  requireRoles,
  type AuthorizationMiddlewareOptions,
} from "./authorization.middleware";

import { AuthenticationMiddleware } from "./authentication.middleware";
import { AuthorizationMiddleware } from "./authorization.middleware";
import { SecurityContextMiddleware } from "./security-context.middleware";
import type { IAuthenticationProvider } from "@server/security/authentication";
import { SecurityContext } from "@server/security/context";
import type { SecurityPipelineContext } from "@server/security/shared";
import {
  toSecurePipelineContext,
  type SecurePipelineContext,
  type SecurityMiddlewareHandler,
} from "./security-middleware.types";

/** Default security pipeline: context → authentication. Authorization is route-specific. */
export function createDefaultSecurityMiddlewares(
  authenticationProvider: IAuthenticationProvider,
): SecurityMiddlewareHandler[] {
  return [
    new SecurityContextMiddleware().handle(),
    new AuthenticationMiddleware(authenticationProvider).handle(),
  ];
}

/** Utility to compose security middleware handlers sequentially. */
export async function runSecurityMiddlewarePipeline(
  middlewares: readonly SecurityMiddlewareHandler[],
  initialContext: SecurityPipelineContext,
): Promise<SecurePipelineContext> {
  const bootstrap = toSecurePipelineContext(
    initialContext,
    SecurityContext.anonymous(initialContext.requestId, initialContext.correlationId),
  );

  let index = 0;

  const dispatch = async (context: SecurePipelineContext): Promise<SecurePipelineContext> => {
    if (index >= middlewares.length) {
      return context;
    }

    const middleware = middlewares[index];
    index += 1;
    return middleware(context, dispatch);
  };

  return dispatch(bootstrap);
}
