import type {
  SDKClient,
  SDKCompatibilityResult,
  SDKGenerationResult,
  SDKManifest,
} from "@server/platform/sdk/sdk/models";

/** Contract for SDK lifecycle orchestration. */
export interface ISDKManager {
  registerClient(client: SDKClient): void;
  generateSDK(clientId: string): SDKGenerationResult;
  validateCompatibility(clientId: string): SDKCompatibilityResult;
  serialize<T>(payload: T, profileId?: string): string;
  deserialize<T>(payload: string, profileId?: string): T;
  generateManifest(clientId: string): SDKManifest;
}
