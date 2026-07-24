import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** Future integration point for external resource pool providers. Not wired yet. */
export interface IRemoteResourcePoolProvider {
  fetchRemote(resourcePoolId: string): Promise<ResourcePool | null>;
  pushRemote(resourcePool: ResourcePool): Promise<void>;
}
