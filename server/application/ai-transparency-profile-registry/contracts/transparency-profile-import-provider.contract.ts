import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** Future integration point for transparency profile import. Not wired yet. */
export interface ITransparencyProfileImportProvider {
  importProfiles(source: string): Promise<readonly TransparencyProfile[]>;
}
