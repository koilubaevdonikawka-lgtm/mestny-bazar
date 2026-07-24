import type {
  GatewayDispatchResult,
  GatewayEndpoint,
  GatewayRequest,
  GatewayRoute,
  GatewayValidationResult,
} from "@server/platform/gateway/gateway/models";

/** Contract for gateway lifecycle orchestration. */
export interface IGatewayManager {
  registerEndpoint(endpoint: GatewayEndpoint): void;
  registerRoute(route: GatewayRoute): void;
  resolve(request: GatewayRequest): GatewayRoute | undefined;
  dispatch(request: GatewayRequest): GatewayDispatchResult;
  validate(request: GatewayRequest): GatewayValidationResult;
}
