import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

export interface IMemoryProfileRepository {
  save(memoryProfile: MemoryProfile): Promise<void>;
  findById(memoryProfileId: string): Promise<MemoryProfile | null>;
  findByName(name: string): Promise<MemoryProfile | null>;
  findByCategory(category: string): Promise<readonly MemoryProfile[]>;
  findAll(): Promise<readonly MemoryProfile[]>;
  delete(memoryProfileId: string): Promise<boolean>;
}
