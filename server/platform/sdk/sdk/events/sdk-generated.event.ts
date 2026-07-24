import type { SDKGenerationResult } from "@server/platform/sdk/sdk/models";

/** Emitted when SDK metadata is generated. */
export interface SDKGeneratedEvent {
  readonly type: "sdk.generated";
  readonly result: SDKGenerationResult;
}

export function createSDKGeneratedEvent(result: SDKGenerationResult): SDKGeneratedEvent {
  return Object.freeze({ type: "sdk.generated", result });
}
