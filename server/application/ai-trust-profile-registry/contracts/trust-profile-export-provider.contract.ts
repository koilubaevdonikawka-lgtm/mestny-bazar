import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** Future integration point for trust profile export. Not wired yet. */
export interface ITrustProfileExportProvider {
  exportProfiles(trustProfiles: readonly TrustProfile[]): Promise<string>;
}
