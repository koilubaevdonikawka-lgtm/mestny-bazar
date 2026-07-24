import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

export interface IComplianceProfileCatalog {
  register(complianceProfile: ComplianceProfile): Promise<void>;
  remove(complianceProfileId: string): Promise<void>;
  findById(complianceProfileId: string): Promise<ComplianceProfile | null>;
  findByName(name: string): Promise<ComplianceProfile | null>;
  findByCategory(category: string): Promise<readonly ComplianceProfile[]>;
  listAll(): Promise<readonly ComplianceProfile[]>;
}
