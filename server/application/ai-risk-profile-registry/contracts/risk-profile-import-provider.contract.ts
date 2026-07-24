import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** Future integration point for risk profile import. Not wired yet. */
export interface IRiskProfileImportProvider {
  importProfiles(source: string): Promise<readonly RiskProfile[]>;
}
