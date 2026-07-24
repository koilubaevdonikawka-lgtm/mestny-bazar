/** Registered AI resource pool — generic resource pool metadata only, no domain knowledge. */
export interface ResourcePool {
  readonly resourcePoolId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterResourcePoolInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateResourcePoolInput {
  readonly resourcePoolId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListResourcePoolsResult {
  readonly resourcePools: readonly ResourcePool[];
  readonly total: number;
}

export interface FindResourcePoolByNameResult {
  readonly resourcePool: ResourcePool | null;
}

export interface ListResourcePoolsByCategoryResult {
  readonly resourcePools: readonly ResourcePool[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteResourcePoolResult {
  readonly resourcePoolId: string;
  readonly deleted: boolean;
}

export interface ResourcePoolRegistryStatistics {
  readonly totalResourcePools: number;
  readonly activeResourcePools: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createResourcePool(input: {
  resourcePoolId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ResourcePool {
  const now = new Date().toISOString();
  return Object.freeze({
    resourcePoolId: input.resourcePoolId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
