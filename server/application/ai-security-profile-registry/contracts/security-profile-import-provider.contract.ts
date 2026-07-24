import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** Future integration point for security profile import. Not wired yet. */
export interface ISecurityProfileImportProvider {
  importProfiles(source: string): Promise<readonly SecurityProfile[]>;
}
