/** DI tokens for the gateway platform. */
export const GatewayTokens = {
  GatewayPlatform: Symbol.for("gateway.platform"),
  GatewayManager: Symbol.for("gateway.manager"),
  EndpointRegistry: Symbol.for("gateway.endpointRegistry"),
  RouteResolver: Symbol.for("gateway.routeResolver"),
  EndpointDispatcher: Symbol.for("gateway.endpointDispatcher"),
  GatewayMiddlewarePipeline: Symbol.for("gateway.middlewarePipeline"),
  SchemaRegistry: Symbol.for("gateway.schemaRegistry"),
  ApiVersionManager: Symbol.for("gateway.apiVersionManager"),
  VersionRouter: Symbol.for("gateway.versionRouter"),
} as const;

export type GatewayToken = (typeof GatewayTokens)[keyof typeof GatewayTokens];
