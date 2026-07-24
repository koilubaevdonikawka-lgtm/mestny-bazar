import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

export interface IRiskProfileCatalog {
  register(riskProfile: RiskProfile): Promise<void>;
  remove(riskProfileId: string): Promise<void>;
  findById(riskProfileId: string): Promise<RiskProfile | null>;
  findByName(name: string): Promise<RiskProfile | null>;
  findByCategory(category: string): Promise<readonly RiskProfile[]>;
  listAll(): Promise<readonly RiskProfile[]>;
}
