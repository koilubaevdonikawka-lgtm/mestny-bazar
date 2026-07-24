import type { GatewayValidationResult } from "@server/platform/gateway/gateway/models";

/** Emitted when a gateway request is validated. */
export interface RequestValidatedEvent {
  readonly type: "gateway.request.validated";
  readonly result: GatewayValidationResult;
}

export function createRequestValidatedEvent(result: GatewayValidationResult): RequestValidatedEvent {
  return Object.freeze({ type: "gateway.request.validated", result });
}
