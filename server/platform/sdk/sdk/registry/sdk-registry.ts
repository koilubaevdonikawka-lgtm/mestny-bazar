import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { SDKClient, SDKDescriptor, SDKVersion } from "@server/platform/sdk/sdk/models";
import { createSDKRegisteredEvent } from "@server/platform/sdk/sdk/events";

/** Central registry for SDK clients, versions, contracts and platforms. */
export class SDKRegistry implements ISDKRegistry {
  private readonly clients = new Map<string, SDKClient>();
  private readonly descriptors = new Map<string, SDKDescriptor>();
  private readonly versions = new Map<string, SDKVersion>();
  private readonly supportedPlatforms = new Set<string>();

  registerClient(client: SDKClient): void {
    if (this.clients.has(client.id)) {
      throw new Error(`SDK client already registered: ${client.id}`);
    }
    this.clients.set(client.id, Object.freeze({ ...client }));
    createSDKRegisteredEvent(client);
  }

  registerDescriptor(descriptor: SDKDescriptor): void {
    this.descriptors.set(descriptor.id, Object.freeze({ ...descriptor }));
  }

  registerVersion(version: SDKVersion): void {
    this.versions.set(version.label, Object.freeze({ ...version }));
  }

  registerSupportedPlatform(platformId: string): void {
    this.supportedPlatforms.add(platformId.trim());
  }

  listClients(): readonly SDKClient[] {
    return Object.freeze([...this.clients.values()]);
  }

  listDescriptors(): readonly SDKDescriptor[] {
    return Object.freeze([...this.descriptors.values()]);
  }

  listVersions(): readonly SDKVersion[] {
    return Object.freeze([...this.versions.values()]);
  }

  listSupportedPlatforms(): readonly string[] {
    return Object.freeze([...this.supportedPlatforms]);
  }

  getClient(clientId: string): SDKClient | undefined {
    return this.clients.get(clientId.trim());
  }
}
