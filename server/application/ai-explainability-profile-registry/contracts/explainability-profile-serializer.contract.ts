import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

export interface IExplainabilityProfileSerializer {
  serialize(explainabilityProfile: ExplainabilityProfile): Promise<string>;
  deserialize(serialized: string): Promise<ExplainabilityProfile>;
}
