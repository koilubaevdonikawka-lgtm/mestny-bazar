import type { AiCapability } from "@server/application/ai-capability-discovery/models/capability.model";

export interface ICapabilityRepository {
  save(capability: AiCapability): Promise<void>;
  findById(capabilityId: string): Promise<AiCapability | null>;
  findByName(name: string): Promise<AiCapability | null>;
  findByCategory(category: string): Promise<readonly AiCapability[]>;
  findAll(): Promise<readonly AiCapability[]>;
  delete(capabilityId: string): Promise<boolean>;
}
