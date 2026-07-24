import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

export interface IExplainabilityProfileRepository {
  save(explainabilityProfile: ExplainabilityProfile): Promise<void>;
  findById(explainabilityProfileId: string): Promise<ExplainabilityProfile | null>;
  findByName(name: string): Promise<ExplainabilityProfile | null>;
  findByCategory(category: string): Promise<readonly ExplainabilityProfile[]>;
  findAll(): Promise<readonly ExplainabilityProfile[]>;
  delete(explainabilityProfileId: string): Promise<boolean>;
}
