import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

export interface IResourceRepository {
  save(resource: Resource): Promise<void>;
  findById(resourceId: string): Promise<Resource | null>;
  findByName(name: string): Promise<Resource | null>;
  findByType(type: string): Promise<readonly Resource[]>;
  findAll(): Promise<readonly Resource[]>;
  delete(resourceId: string): Promise<boolean>;
}
