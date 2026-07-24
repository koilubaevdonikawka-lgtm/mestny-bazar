import type { ExplainabilityProfile } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** Future integration point for external explainability profile providers. Not wired yet. */
export interface IRemoteExplainabilityProfileProvider {
  fetchRemote(explainabilityProfileId: string): Promise<ExplainabilityProfile | null>;
  pushRemote(explainabilityProfile: ExplainabilityProfile): Promise<void>;
}
