import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

export interface IProfileSerializer {
  serialize(profile: Profile): Promise<string>;
  deserialize(serialized: string): Promise<Profile>;
}
