import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** Future integration point for ethics profile export. Not wired yet. */
export interface IEthicsProfileExportProvider {
  exportProfiles(ethicsProfiles: readonly EthicsProfile[]): Promise<string>;
}
