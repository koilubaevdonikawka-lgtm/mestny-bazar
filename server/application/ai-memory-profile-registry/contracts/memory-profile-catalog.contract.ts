import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

export interface IMemoryProfileCatalog {
  register(memoryProfile: MemoryProfile): Promise<void>;
  remove(memoryProfileId: string): Promise<void>;
  findById(memoryProfileId: string): Promise<MemoryProfile | null>;
  findByName(name: string): Promise<MemoryProfile | null>;
  findByCategory(category: string): Promise<readonly MemoryProfile[]>;
  listAll(): Promise<readonly MemoryProfile[]>;
}
