import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** Future integration point for external security profile providers. Not wired yet. */
export interface IRemoteSecurityProfileProvider {
  fetchRemote(securityProfileId: string): Promise<SecurityProfile | null>;
  pushRemote(securityProfile: SecurityProfile): Promise<void>;
}
