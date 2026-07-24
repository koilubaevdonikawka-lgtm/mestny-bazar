import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

export interface IRiskProfileSerializer {
  serialize(riskProfile: RiskProfile): Promise<string>;
  deserialize(serialized: string): Promise<RiskProfile>;
}
