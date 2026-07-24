import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

export interface ISecurityProfileSerializer {
  serialize(securityProfile: SecurityProfile): Promise<string>;
  deserialize(serialized: string): Promise<SecurityProfile>;
}
