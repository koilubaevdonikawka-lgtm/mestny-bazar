import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

/** Future integration point for resource export. Not wired yet. */
export interface IResourceExportProvider {
  exportTo(resources: readonly Resource[]): Promise<string>;
}
