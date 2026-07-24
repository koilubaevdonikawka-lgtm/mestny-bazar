import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

/** Future integration point for resource import. Not wired yet. */
export interface IResourceImportProvider {
  importFrom(source: string): Promise<readonly Resource[]>;
}
