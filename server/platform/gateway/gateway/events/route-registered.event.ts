import type { GatewayRoute } from "@server/platform/gateway/gateway/models";

/** Emitted when a gateway route is registered. */
export interface RouteRegisteredEvent {
  readonly type: "gateway.route.registered";
  readonly route: GatewayRoute;
}

export function createRouteRegisteredEvent(route: GatewayRoute): RouteRegisteredEvent {
  return Object.freeze({ type: "gateway.route.registered", route });
}
