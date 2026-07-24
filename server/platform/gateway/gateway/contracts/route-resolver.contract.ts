import type { GatewayRequest, GatewayRoute } from "@server/platform/gateway/gateway/models";

/** Contract for gateway route resolution. */
export interface IRouteResolver {
  resolve(request: GatewayRequest): GatewayRoute | undefined;
}
