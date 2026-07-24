import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

export interface IResourceSerializer {
  serialize(resource: Resource): Promise<string>;
  deserialize(serialized: string): Promise<Resource>;
}
