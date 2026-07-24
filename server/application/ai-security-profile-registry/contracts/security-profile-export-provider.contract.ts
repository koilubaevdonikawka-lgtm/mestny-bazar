import type { SecurityProfile } from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** Future integration point for security profile export. Not wired yet. */
export interface ISecurityProfileExportProvider {
  exportProfiles(securityProfiles: readonly SecurityProfile[]): Promise<string>;
}
