import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** Future integration point for external compliance profile providers. Not wired yet. */
export interface IRemoteComplianceProfileProvider {
  fetchRemote(complianceProfileId: string): Promise<ComplianceProfile | null>;
  pushRemote(complianceProfile: ComplianceProfile): Promise<void>;
}
