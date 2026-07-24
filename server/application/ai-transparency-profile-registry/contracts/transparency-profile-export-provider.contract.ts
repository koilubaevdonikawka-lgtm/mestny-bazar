import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** Future integration point for transparency profile export. Not wired yet. */
export interface ITransparencyProfileExportProvider {
  exportProfiles(transparencyProfiles: readonly TransparencyProfile[]): Promise<string>;
}
