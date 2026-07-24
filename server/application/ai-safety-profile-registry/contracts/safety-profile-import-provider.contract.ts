import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** Future integration point for safety profile import. Not wired yet. */
export interface ISafetyProfileImportProvider {
  importProfiles(source: string): Promise<readonly SafetyProfile[]>;
}
