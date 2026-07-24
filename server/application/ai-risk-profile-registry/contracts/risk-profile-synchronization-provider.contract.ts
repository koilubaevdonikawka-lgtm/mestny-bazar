import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** Future integration point for risk profile synchronization. Not wired yet. */
export interface IRiskProfileSynchronizationProvider {
  synchronize(riskProfiles: readonly RiskProfile[]): Promise<void>;
}
