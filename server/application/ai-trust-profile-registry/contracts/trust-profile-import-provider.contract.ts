import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** Future integration point for trust profile import. Not wired yet. */
export interface ITrustProfileImportProvider {
  importProfiles(source: string): Promise<readonly TrustProfile[]>;
}
