import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** Future integration point for memory profile synchronization. Not wired yet. */
export interface IMemoryProfileSynchronizationProvider {
  synchronize(memoryProfiles: readonly MemoryProfile[]): Promise<void>;
}
