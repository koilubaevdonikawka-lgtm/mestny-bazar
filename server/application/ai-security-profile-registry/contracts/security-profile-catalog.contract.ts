import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

export interface ISecurityProfileCatalog {
  register(securityProfile: SecurityProfile): Promise<void>;
  remove(securityProfileId: string): Promise<void>;
  findById(securityProfileId: string): Promise<SecurityProfile | null>;
  findByName(name: string): Promise<SecurityProfile | null>;
  findByCategory(category: string): Promise<readonly SecurityProfile[]>;
  listAll(): Promise<readonly SecurityProfile[]>;
}
