import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

export interface IResourceCatalog {
  register(resource: Resource): Promise<void>;
  remove(resourceId: string): Promise<void>;
  findById(resourceId: string): Promise<Resource | null>;
  findByName(name: string): Promise<Resource | null>;
  findByType(type: string): Promise<readonly Resource[]>;
  listAll(): Promise<readonly Resource[]>;
}
