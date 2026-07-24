import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** Future integration point for compliance profile import. Not wired yet. */
export interface IComplianceProfileImportProvider {
  importProfiles(source: string): Promise<readonly ComplianceProfile[]>;
}
