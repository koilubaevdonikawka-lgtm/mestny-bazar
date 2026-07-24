import type { GatewayRequest } from "./gateway-request.model";
import type { GatewayResponse } from "./gateway-response.model";

export {
  type GatewayEndpointKind,
  type GatewayEndpoint,
  createGatewayEndpoint,
} from "./gateway-endpoint.model";
export {
  type GatewayRoute,
  createGatewayRoute,
} from "./gateway-route.model";
export {
  type GatewayRequest,
  createGatewayRequest,
} from "./gateway-request.model";
export {
  type GatewayResponse,
  createGatewayResponse,
} from "./gateway-response.model";
export {
  type ApiVersionDescriptor,
  createApiVersionDescriptor,
} from "./api-version-descriptor.model";

export interface GatewayValidationResult {
  readonly requestId: string;
  readonly valid: boolean;
  readonly validatedAt: string;
  readonly violations: readonly string[];
}

export function createGatewayValidationResult(input: {
  requestId: string;
  valid: boolean;
  violations?: readonly string[];
}): GatewayValidationResult {
  return Object.freeze({
    requestId: input.requestId.trim(),
    valid: input.valid,
    validatedAt: new Date().toISOString(),
    violations: Object.freeze([...(input.violations ?? [])]),
  });
}

export interface GatewayDispatchResult {
  readonly request: GatewayRequest;
  readonly response: GatewayResponse;
  readonly middlewareApplied: readonly string[];
}

export function createGatewayDispatchResult(input: {
  request: GatewayRequest;
  response: GatewayResponse;
  middlewareApplied?: readonly string[];
}): GatewayDispatchResult {
  return Object.freeze({
    request: input.request,
    response: input.response,
    middlewareApplied: Object.freeze([...(input.middlewareApplied ?? [])]),
  });
}
