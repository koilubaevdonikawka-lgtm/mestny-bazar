import type { IRouteResolver } from "@server/platform/gateway/gateway/contracts";
import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { GatewayRequest, GatewayRoute } from "@server/platform/gateway/gateway/models";
import type { VersionRouter } from "@server/platform/gateway/gateway/routing/version-router";

/** Resolves gateway routes from request path and version. */
export class RouteResolver implements IRouteResolver {
  constructor(
    private readonly registry: IEndpointRegistry,
    private readonly versionRouter: VersionRouter,
  ) {}

  resolve(request: GatewayRequest): GatewayRoute | undefined {
    const version = this.versionRouter.resolve(request);
    const normalizedPath = request.path.split("?")[0];

    for (const route of this.registry.listRoutes()) {
      if (route.version !== version) {
        continue;
      }
      if (this.matchesPattern(normalizedPath, route.pattern)) {
        const endpoint = this.registry.getEndpoint(route.endpointId);
        if (endpoint && endpoint.method === request.method) {
          return route;
        }
      }
    }

    return undefined;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    if (pattern === path) {
      return true;
    }
    const regex = new RegExp(
      `^${pattern.replace(/\{[^}]+\}/g, "[^/]+")}$`,
    );
    return regex.test(path);
  }
}
