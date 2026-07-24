import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** Future integration point for ethics profile synchronization. Not wired yet. */
export interface IEthicsProfileSynchronizationProvider {
  synchronize(ethicsProfiles: readonly EthicsProfile[]): Promise<void>;
}
