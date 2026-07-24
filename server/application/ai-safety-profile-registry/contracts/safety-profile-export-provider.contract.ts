import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** Future integration point for safety profile export. Not wired yet. */
export interface ISafetyProfileExportProvider {
  exportProfiles(safetyProfiles: readonly SafetyProfile[]): Promise<string>;
}
