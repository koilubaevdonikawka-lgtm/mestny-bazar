import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** Future integration point for policy profile import. Not wired yet. */
export interface IPolicyProfileImportProvider {
  importProfiles(source: string): Promise<readonly PolicyProfile[]>;
}
