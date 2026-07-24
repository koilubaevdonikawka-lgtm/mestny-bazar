import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** Future integration point for external memory profile providers. Not wired yet. */
export interface IRemoteMemoryProfileProvider {
  fetchRemote(memoryProfileId: string): Promise<MemoryProfile | null>;
  pushRemote(memoryProfile: MemoryProfile): Promise<void>;
}
