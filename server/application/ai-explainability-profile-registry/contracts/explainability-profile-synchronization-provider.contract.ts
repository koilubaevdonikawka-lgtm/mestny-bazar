import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** Future integration point for explainability profile synchronization. Not wired yet. */
export interface IExplainabilityProfileSynchronizationProvider {
  synchronize(explainabilityProfiles: readonly ExplainabilityProfile[]): Promise<void>;
}
