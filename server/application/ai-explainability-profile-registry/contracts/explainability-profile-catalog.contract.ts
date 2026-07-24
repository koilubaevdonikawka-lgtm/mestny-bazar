import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

export interface IExplainabilityProfileCatalog {
  register(explainabilityProfile: ExplainabilityProfile): Promise<void>;
  remove(explainabilityProfileId: string): Promise<void>;
  findById(explainabilityProfileId: string): Promise<ExplainabilityProfile | null>;
  findByName(name: string): Promise<ExplainabilityProfile | null>;
  findByCategory(category: string): Promise<readonly ExplainabilityProfile[]>;
  listAll(): Promise<readonly ExplainabilityProfile[]>;
}
