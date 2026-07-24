import type { SDKManifest } from "@server/platform/sdk/sdk/models";

/** Contract for SDK manifest metadata generation. */
export interface ISDKGenerator {
  generate(clientId: string, version: string): SDKManifest;
}
