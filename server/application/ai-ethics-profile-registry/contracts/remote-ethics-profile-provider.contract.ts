import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** Future integration point for external ethics profile providers. Not wired yet. */
export interface IRemoteEthicsProfileProvider {
  fetchRemote(ethicsProfileId: string): Promise<EthicsProfile | null>;
  pushRemote(ethicsProfile: EthicsProfile): Promise<void>;
}
