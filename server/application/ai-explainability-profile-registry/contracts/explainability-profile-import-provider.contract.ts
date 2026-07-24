import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** Future integration point for explainability profile import. Not wired yet. */
export interface IExplainabilityProfileImportProvider {
  importProfiles(source: string): Promise<readonly ExplainabilityProfile[]>;
}
