import type { RiskProfile } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

export interface IRiskProfileRepository {
  save(riskProfile: RiskProfile): Promise<void>;
  findById(riskProfileId: string): Promise<RiskProfile | null>;
  findByName(name: string): Promise<RiskProfile | null>;
  findByCategory(category: string): Promise<readonly RiskProfile[]>;
  findAll(): Promise<readonly RiskProfile[]>;
  delete(riskProfileId: string): Promise<boolean>;
}
