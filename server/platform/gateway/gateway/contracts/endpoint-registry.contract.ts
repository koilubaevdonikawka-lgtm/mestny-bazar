import type { ApiVersionDescriptor, GatewayEndpoint, GatewayRoute } from "@server/platform/gateway/gateway/models";

/** Contract for endpoint and route registration. */
export interface IEndpointRegistry {
  registerEndpoint(endpoint: GatewayEndpoint): void;
  registerRoute(route: GatewayRoute): void;
  registerVersion(version: ApiVersionDescriptor): void;
  listEndpoints(): readonly GatewayEndpoint[];
  listRoutes(): readonly GatewayRoute[];
  listVersions(): readonly ApiVersionDescriptor[];
  getEndpoint(endpointId: string): GatewayEndpoint | undefined;
  getRoute(routeId: string): GatewayRoute | undefined;
}
