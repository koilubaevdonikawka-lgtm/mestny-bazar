import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** Future integration point for ethics profile import. Not wired yet. */
export interface IEthicsProfileImportProvider {
  importProfiles(source: string): Promise<readonly EthicsProfile[]>;
}
