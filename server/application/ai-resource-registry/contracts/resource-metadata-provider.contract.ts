import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

/** Future integration point for resource metadata enrichment. Not wired yet. */
export interface IResourceMetadataProvider {
  getMetadata(resource: Resource): Promise<Record<string, unknown>>;
}
