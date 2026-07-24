import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** Future integration point for memory profile import. Not wired yet. */
export interface IMemoryProfileImportProvider {
  importProfiles(source: string): Promise<readonly MemoryProfile[]>;
}
