import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

export interface IProfileCatalog {
  register(profile: Profile): Promise<void>;
  remove(profileId: string): Promise<void>;
  findById(profileId: string): Promise<Profile | null>;
  findByName(name: string): Promise<Profile | null>;
  findByType(type: string): Promise<readonly Profile[]>;
  listAll(): Promise<readonly Profile[]>;
}
