import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

export interface IResourceProfileRepository {
  save(resourceProfile: ResourceProfile): Promise<void>;
  findById(resourceProfileId: string): Promise<ResourceProfile | null>;
  findByName(name: string): Promise<ResourceProfile | null>;
  findByCategory(category: string): Promise<readonly ResourceProfile[]>;
  findAll(): Promise<readonly ResourceProfile[]>;
  delete(resourceProfileId: string): Promise<boolean>;
}
