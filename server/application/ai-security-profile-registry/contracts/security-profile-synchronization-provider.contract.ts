import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** Future integration point for security profile synchronization. Not wired yet. */
export interface ISecurityProfileSynchronizationProvider {
  synchronize(securityProfiles: readonly SecurityProfile[]): Promise<void>;
}
