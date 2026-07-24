import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** Future integration point for resource pool synchronization. Not wired yet. */
export interface IResourcePoolSynchronizationProvider {
  synchronize(resourcePools: readonly ResourcePool[]): Promise<void>;
}
