import type { GatewayDispatchResult } from "@server/platform/gateway/gateway/models";

/** Emitted when gateway dispatch completes. */
export interface GatewayDispatchCompletedEvent {
  readonly type: "gateway.dispatch.completed";
  readonly result: GatewayDispatchResult;
}

export function createGatewayDispatchCompletedEvent(
  result: GatewayDispatchResult,
): GatewayDispatchCompletedEvent {
  return Object.freeze({ type: "gateway.dispatch.completed", result });
}
