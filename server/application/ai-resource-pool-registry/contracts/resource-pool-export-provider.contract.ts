import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** Future integration point for resource pool export. Not wired yet. */
export interface IResourcePoolExportProvider {
  exportResourcePools(resourcePools: readonly ResourcePool[]): Promise<string>;
}
