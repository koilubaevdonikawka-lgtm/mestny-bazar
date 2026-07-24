import type { SDKClient, SDKDescriptor, SDKVersion } from "@server/platform/sdk/sdk/models";

/** Contract for SDK client and version registration. */
export interface ISDKRegistry {
  registerClient(client: SDKClient): void;
  registerDescriptor(descriptor: SDKDescriptor): void;
  registerVersion(version: SDKVersion): void;
  registerSupportedPlatform(platformId: string): void;
  listClients(): readonly SDKClient[];
  listDescriptors(): readonly SDKDescriptor[];
  listVersions(): readonly SDKVersion[];
  listSupportedPlatforms(): readonly string[];
  getClient(clientId: string): SDKClient | undefined;
}
