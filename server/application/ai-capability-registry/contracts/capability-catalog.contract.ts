import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

export interface ICapabilityCatalog {
  register(capability: Capability): Promise<void>;
  remove(capabilityId: string): Promise<void>;
  findById(capabilityId: string): Promise<Capability | null>;
  findByName(name: string): Promise<Capability | null>;
  findByCategory(category: string): Promise<readonly Capability[]>;
  listAll(): Promise<readonly Capability[]>;
}
