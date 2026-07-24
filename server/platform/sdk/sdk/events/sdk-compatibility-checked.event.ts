import type { SDKCompatibilityResult } from "@server/platform/sdk/sdk/models";

/** Emitted when SDK compatibility is checked. */
export interface SDKCompatibilityCheckedEvent {
  readonly type: "sdk.compatibility.checked";
  readonly result: SDKCompatibilityResult;
}

export function createSDKCompatibilityCheckedEvent(
  result: SDKCompatibilityResult,
): SDKCompatibilityCheckedEvent {
  return Object.freeze({ type: "sdk.compatibility.checked", result });
}
