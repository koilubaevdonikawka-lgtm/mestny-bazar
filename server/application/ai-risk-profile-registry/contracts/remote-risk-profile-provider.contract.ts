import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** Future integration point for external risk profile providers. Not wired yet. */
export interface IRemoteRiskProfileProvider {
  fetchRemote(riskProfileId: string): Promise<RiskProfile | null>;
  pushRemote(riskProfile: RiskProfile): Promise<void>;
}
