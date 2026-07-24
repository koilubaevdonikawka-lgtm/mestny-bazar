import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** Future integration point for compliance profile synchronization. Not wired yet. */
export interface IComplianceProfileSynchronizationProvider {
  synchronize(complianceProfiles: readonly ComplianceProfile[]): Promise<void>;
}
