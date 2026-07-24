import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** Future integration point for compliance profile export. Not wired yet. */
export interface IComplianceProfileExportProvider {
  exportProfiles(complianceProfiles: readonly ComplianceProfile[]): Promise<string>;
}
