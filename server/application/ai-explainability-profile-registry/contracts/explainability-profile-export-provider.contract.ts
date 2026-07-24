import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** Future integration point for explainability profile export. Not wired yet. */
export interface IExplainabilityProfileExportProvider {
  exportProfiles(explainabilityProfiles: readonly ExplainabilityProfile[]): Promise<string>;
}
