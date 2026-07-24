import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

export interface ISecurityProfileRepository {
  save(securityProfile: SecurityProfile): Promise<void>;
  findById(securityProfileId: string): Promise<SecurityProfile | null>;
  findByName(name: string): Promise<SecurityProfile | null>;
  findByCategory(category: string): Promise<readonly SecurityProfile[]>;
  findAll(): Promise<readonly SecurityProfile[]>;
  delete(securityProfileId: string): Promise<boolean>;
}
