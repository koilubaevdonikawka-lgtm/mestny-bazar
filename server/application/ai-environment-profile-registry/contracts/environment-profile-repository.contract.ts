import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

export interface IEnvironmentProfileRepository {
  save(environmentProfile: EnvironmentProfile): Promise<void>;
  findById(environmentProfileId: string): Promise<EnvironmentProfile | null>;
  findByName(name: string): Promise<EnvironmentProfile | null>;
  findByCategory(category: string): Promise<readonly EnvironmentProfile[]>;
  findAll(): Promise<readonly EnvironmentProfile[]>;
  delete(environmentProfileId: string): Promise<boolean>;
}
