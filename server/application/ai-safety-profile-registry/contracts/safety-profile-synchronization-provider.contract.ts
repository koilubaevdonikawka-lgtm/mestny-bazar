import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** Future integration point for safety profile synchronization. Not wired yet. */
export interface ISafetyProfileSynchronizationProvider {
  synchronize(safetyProfiles: readonly SafetyProfile[]): Promise<void>;
}
