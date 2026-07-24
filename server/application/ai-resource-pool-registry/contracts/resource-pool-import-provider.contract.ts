import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** Future integration point for resource pool import. Not wired yet. */
export interface IResourcePoolImportProvider {
  importResourcePools(source: string): Promise<readonly ResourcePool[]>;
}
