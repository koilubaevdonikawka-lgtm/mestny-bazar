import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

export interface IProfileRepository {
  save(profile: Profile): Promise<void>;
  findById(profileId: string): Promise<Profile | null>;
  findByName(name: string): Promise<Profile | null>;
  findByType(type: string): Promise<readonly Profile[]>;
  findAll(): Promise<readonly Profile[]>;
  delete(profileId: string): Promise<boolean>;
}
