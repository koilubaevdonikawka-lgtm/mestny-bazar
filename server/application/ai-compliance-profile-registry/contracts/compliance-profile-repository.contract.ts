import type { ComplianceProfile } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

export interface IComplianceProfileRepository {
  save(complianceProfile: ComplianceProfile): Promise<void>;
  findById(complianceProfileId: string): Promise<ComplianceProfile | null>;
  findByName(name: string): Promise<ComplianceProfile | null>;
  findByCategory(category: string): Promise<readonly ComplianceProfile[]>;
  findAll(): Promise<readonly ComplianceProfile[]>;
  delete(complianceProfileId: string): Promise<boolean>;
}
