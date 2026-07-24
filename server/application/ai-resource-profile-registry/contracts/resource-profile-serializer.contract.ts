import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

export interface IResourceProfileSerializer {
  serialize(resourceProfile: ResourceProfile): Promise<string>;
  deserialize(serialized: string): Promise<ResourceProfile>;
}
