import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { ApiVersionDescriptor, GatewayEndpoint, GatewayRoute } from "@server/platform/gateway/gateway/models";
import {
  createEndpointRegisteredEvent,
  createRouteRegisteredEvent,
} from "@server/platform/gateway/gateway/events";

/** Central registry for gateway endpoints, routes and API versions. */
export class EndpointRegistry implements IEndpointRegistry {
  private readonly endpoints = new Map<string, GatewayEndpoint>();
  private readonly routes = new Map<string, GatewayRoute>();
  private readonly versions = new Map<string, ApiVersionDescriptor>();

  registerEndpoint(endpoint: GatewayEndpoint): void {
    if (this.endpoints.has(endpoint.id)) {
      throw new Error(`Gateway endpoint already registered: ${endpoint.id}`);
    }
    this.endpoints.set(endpoint.id, Object.freeze({ ...endpoint }));
    createEndpointRegisteredEvent(endpoint);
  }

  registerRoute(route: GatewayRoute): void {
    if (this.routes.has(route.id)) {
      throw new Error(`Gateway route already registered: ${route.id}`);
    }
    this.routes.set(route.id, Object.freeze({ ...route }));
    createRouteRegisteredEvent(route);
  }

  registerVersion(version: ApiVersionDescriptor): void {
    this.versions.set(version.label, Object.freeze({ ...version }));
  }

  listEndpoints(): readonly GatewayEndpoint[] {
    return Object.freeze([...this.endpoints.values()]);
  }

  listRoutes(): readonly GatewayRoute[] {
    return Object.freeze([...this.routes.values()]);
  }

  listVersions(): readonly ApiVersionDescriptor[] {
    return Object.freeze([...this.versions.values()]);
  }

  getEndpoint(endpointId: string): GatewayEndpoint | undefined {
    return this.endpoints.get(endpointId.trim());
  }

  getRoute(routeId: string): GatewayRoute | undefined {
    return this.routes.get(routeId.trim());
  }
}
