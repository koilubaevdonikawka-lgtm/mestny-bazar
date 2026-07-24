import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** Future integration point for policy profile export. Not wired yet. */
export interface IPolicyProfileExportProvider {
  exportProfiles(policyProfiles: readonly PolicyProfile[]): Promise<string>;
}
