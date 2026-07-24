import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

export interface ITransparencyProfileSerializer {
  serialize(transparencyProfile: TransparencyProfile): Promise<string>;
  deserialize(serialized: string): Promise<TransparencyProfile>;
}
