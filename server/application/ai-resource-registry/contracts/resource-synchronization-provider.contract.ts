import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

/** Future integration point for resource synchronization. Not wired yet. */
export interface IResourceSynchronizationProvider {
  synchronize(resources: readonly Resource[]): Promise<void>;
}
