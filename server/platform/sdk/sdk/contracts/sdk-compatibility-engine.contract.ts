import type { SDKCompatibilityResult } from "@server/platform/sdk/sdk/models";

/** Contract for SDK compatibility assessment. */
export interface ISDKCompatibilityEngine {
  check(clientId: string, clientVersion: string): SDKCompatibilityResult;
}
