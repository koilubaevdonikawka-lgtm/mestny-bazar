import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

export interface IMemoryProfileSerializer {
  serialize(memoryProfile: MemoryProfile): Promise<string>;
  deserialize(serialized: string): Promise<MemoryProfile>;
}
