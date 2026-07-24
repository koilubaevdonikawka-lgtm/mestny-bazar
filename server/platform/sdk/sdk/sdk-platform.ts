import type { ISDKManager } from "@server/platform/sdk/sdk/contracts";
import type {
  SDKClient,
  SDKCompatibilityResult,
  SDKGenerationResult,
  SDKManifest,
} from "@server/platform/sdk/sdk/models";

/** Public SDK platform facade. */
export class SDKPlatform {
  constructor(private readonly sdkManager: ISDKManager) {}

  registerClient(client: SDKClient): void {
    this.sdkManager.registerClient(client);
  }

  generateSDK(clientId: string): SDKGenerationResult {
    return this.sdkManager.generateSDK(clientId);
  }

  validateCompatibility(clientId: string): SDKCompatibilityResult {
    return this.sdkManager.validateCompatibility(clientId);
  }

  serialize<T>(payload: T, profileId?: string): string {
    return this.sdkManager.serialize(payload, profileId);
  }

  deserialize<T>(payload: string, profileId?: string): T {
    return this.sdkManager.deserialize(payload, profileId);
  }

  generateManifest(clientId: string): SDKManifest {
    return this.sdkManager.generateManifest(clientId);
  }
}
