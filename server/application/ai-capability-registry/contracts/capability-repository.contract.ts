import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

export interface ICapabilityRepository {
  save(capability: Capability): Promise<void>;
  findById(capabilityId: string): Promise<Capability | null>;
  findByName(name: string): Promise<Capability | null>;
  findByCategory(category: string): Promise<readonly Capability[]>;
  findAll(): Promise<readonly Capability[]>;
  delete(capabilityId: string): Promise<boolean>;
}
