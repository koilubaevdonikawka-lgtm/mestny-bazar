import { createGatewayEndpoint, createGatewayRoute } from "@server/platform/gateway/gateway/models";

/** Default gateway endpoints catalog. */
export const DEFAULT_GATEWAY_ENDPOINTS = Object.freeze([
  createGatewayEndpoint({
    id: "endpoint-health",
    path: "/v1.0/health",
    method: "GET",
    kind: "public",
    version: "v1.0",
    description: "Platform health metadata endpoint.",
  }),
  createGatewayEndpoint({
    id: "endpoint-sdk-manifest",
    path: "/v1.0/sdk/manifest",
    method: "GET",
    kind: "sdk",
    version: "v1.0",
    description: "SDK manifest metadata endpoint.",
  }),
  createGatewayEndpoint({
    id: "endpoint-webhook-events",
    path: "/v1.0/webhooks/events",
    method: "POST",
    kind: "webhook",
    version: "v1.0",
    description: "Webhook event ingestion metadata endpoint.",
  }),
  createGatewayEndpoint({
    id: "endpoint-platform-docs",
    path: "/v1.0/platform/documentation",
    method: "GET",
    kind: "internal-platform",
    version: "v1.0",
    description: "Documentation platform metadata endpoint.",
  }),
]);

export const DEFAULT_GATEWAY_ROUTES = Object.freeze([
  createGatewayRoute({
    id: "route-health",
    pattern: "/v1.0/health",
    endpointId: "endpoint-health",
    version: "v1.0",
  }),
  createGatewayRoute({
    id: "route-sdk-manifest",
    pattern: "/v1.0/sdk/manifest",
    endpointId: "endpoint-sdk-manifest",
    version: "v1.0",
  }),
  createGatewayRoute({
    id: "route-webhook-events",
    pattern: "/v1.0/webhooks/events",
    endpointId: "endpoint-webhook-events",
    version: "v1.0",
  }),
  createGatewayRoute({
    id: "route-platform-docs",
    pattern: "/v1.0/platform/documentation",
    endpointId: "endpoint-platform-docs",
    version: "v1.0",
  }),
]);
