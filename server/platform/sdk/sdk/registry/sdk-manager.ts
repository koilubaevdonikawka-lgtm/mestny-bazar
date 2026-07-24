import type { ISDKManager } from "@server/platform/sdk/sdk/contracts";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ISDKGenerator } from "@server/platform/sdk/sdk/contracts";
import type { ISerializationEngine } from "@server/platform/sdk/sdk/contracts";
import type { ISDKCompatibilityEngine } from "@server/platform/sdk/sdk/contracts";
import {
  createSDKDescriptor,
  createSDKGenerationResult,
  type SDKClient,
  type SDKCompatibilityResult,
  type SDKGenerationResult,
  type SDKManifest,
} from "@server/platform/sdk/sdk/models";
import { createSDKGeneratedEvent } from "@server/platform/sdk/sdk/events";

/** Orchestrates SDK registration, generation, validation and serialization. */
export class SDKManager implements ISDKManager {
  constructor(
    private readonly registry: ISDKRegistry,
    private readonly generator: ISDKGenerator,
    private readonly compatibilityEngine: ISDKCompatibilityEngine,
    private readonly serializationEngine: ISerializationEngine,
  ) {}

  registerClient(client: SDKClient): void {
    this.registry.registerClient(client);
    this.registry.registerDescriptor(
      createSDKDescriptor({
        id: client.id,
        name: client.name,
        clientKind: client.kind,
        version: client.version,
      }),
    );
  }

  generateSDK(clientId: string): SDKGenerationResult {
    const client = this.requireClient(clientId);
    const manifest = this.generator.generate(clientId, client.version);
    const result = createSDKGenerationResult({ clientId, manifest });
    createSDKGeneratedEvent(result);
    return result;
  }

  validateCompatibility(clientId: string): SDKCompatibilityResult {
    const client = this.requireClient(clientId);
    return this.compatibilityEngine.check(clientId, client.version);
  }

  serialize<T>(payload: T, profileId?: string): string {
    const profile = this.serializationEngine.getProfile(profileId);
    return this.serializationEngine.serialize(payload, profile);
  }

  deserialize<T>(payload: string, profileId?: string): T {
    const profile = this.serializationEngine.getProfile(profileId);
    return this.serializationEngine.deserialize<T>(payload, profile);
  }

  generateManifest(clientId: string): SDKManifest {
    const client = this.requireClient(clientId);
    return this.generator.generate(clientId, client.version);
  }

  private requireClient(clientId: string): SDKClient {
    const client = this.registry.getClient(clientId);
    if (!client) {
      throw new Error(`SDK client not found: ${clientId}`);
    }
    return client;
  }
}
