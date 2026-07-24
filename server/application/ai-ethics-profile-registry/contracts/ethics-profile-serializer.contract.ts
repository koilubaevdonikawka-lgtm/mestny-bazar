import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

export interface IEthicsProfileSerializer {
  serialize(ethicsProfile: EthicsProfile): Promise<string>;
  deserialize(serialized: string): Promise<EthicsProfile>;
}
