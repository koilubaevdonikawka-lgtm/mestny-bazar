import type { GatewayEndpoint } from "@server/platform/gateway/gateway/models";

/** Emitted when a gateway endpoint is registered. */
export interface EndpointRegisteredEvent {
  readonly type: "gateway.endpoint.registered";
  readonly endpoint: GatewayEndpoint;
}

export function createEndpointRegisteredEvent(endpoint: GatewayEndpoint): EndpointRegisteredEvent {
  return Object.freeze({ type: "gateway.endpoint.registered", endpoint });
}
