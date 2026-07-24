import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

export interface IEnvironmentProfileCatalog {
  register(environmentProfile: EnvironmentProfile): Promise<void>;
  remove(environmentProfileId: string): Promise<void>;
  findById(environmentProfileId: string): Promise<EnvironmentProfile | null>;
  findByName(name: string): Promise<EnvironmentProfile | null>;
  findByCategory(category: string): Promise<readonly EnvironmentProfile[]>;
  listAll(): Promise<readonly EnvironmentProfile[]>;
}
