import type { AiCapability } from "@server/application/ai-capability-discovery/models/capability.model";

export interface ICapabilityCatalog {
  listAll(): Promise<readonly AiCapability[]>;
  findByName(name: string): Promise<AiCapability | null>;
  listByCategory(category: string): Promise<readonly AiCapability[]>;
}
