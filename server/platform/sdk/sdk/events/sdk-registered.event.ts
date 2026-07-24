import type { SDKClient } from "@server/platform/sdk/sdk/models";

/** Emitted when an SDK client is registered. */
export interface SDKRegisteredEvent {
  readonly type: "sdk.registered";
  readonly client: SDKClient;
}

export function createSDKRegisteredEvent(client: SDKClient): SDKRegisteredEvent {
  return Object.freeze({ type: "sdk.registered", client });
}
