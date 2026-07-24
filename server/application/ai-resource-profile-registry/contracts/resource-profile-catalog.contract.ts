import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

export interface IResourceProfileCatalog {
  register(resourceProfile: ResourceProfile): Promise<void>;
  remove(resourceProfileId: string): Promise<void>;
  findById(resourceProfileId: string): Promise<ResourceProfile | null>;
  findByName(name: string): Promise<ResourceProfile | null>;
  findByCategory(category: string): Promise<readonly ResourceProfile[]>;
  listAll(): Promise<readonly ResourceProfile[]>;
}
