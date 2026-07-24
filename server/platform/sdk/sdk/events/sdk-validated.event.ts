import type { SDKCompatibilityResult } from "@server/platform/sdk/sdk/models";

/** Emitted when SDK compatibility validation completes. */
export interface SDKValidatedEvent {
  readonly type: "sdk.validated";
  readonly result: SDKCompatibilityResult;
}

export function createSDKValidatedEvent(result: SDKCompatibilityResult): SDKValidatedEvent {
  return Object.freeze({ type: "sdk.validated", result });
}
