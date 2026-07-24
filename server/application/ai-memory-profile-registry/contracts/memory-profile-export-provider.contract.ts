import type { MemoryProfile } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** Future integration point for memory profile export. Not wired yet. */
export interface IMemoryProfileExportProvider {
  exportProfiles(memoryProfiles: readonly MemoryProfile[]): Promise<string>;
}
