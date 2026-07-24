import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** Future integration point for risk profile export. Not wired yet. */
export interface IRiskProfileExportProvider {
  exportProfiles(riskProfiles: readonly RiskProfile[]): Promise<string>;
}
