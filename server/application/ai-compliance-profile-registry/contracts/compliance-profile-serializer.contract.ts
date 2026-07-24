import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

export interface IComplianceProfileSerializer {
  serialize(complianceProfile: ComplianceProfile): Promise<string>;
  deserialize(serialized: string): Promise<ComplianceProfile>;
}
