/** Registered AI resource — generic resource metadata only, no domain knowledge. */
export interface Resource {
  readonly resourceId: string;
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterResourceInput {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateResourceInput {
  readonly resourceId: string;
  readonly name?: string;
  readonly type?: string;
  readonly description?: string;
  readonly status?: "active" | "inactive";
}

export interface ListResourcesResult {
  readonly resources: readonly Resource[];
  readonly total: number;
}

export interface FindResourceByNameResult {
  readonly resource: Resource | null;
}

export interface ListResourcesByTypeResult {
  readonly resources: readonly Resource[];
  readonly total: number;
  readonly type: string;
}

export interface DeleteResourceResult {
  readonly resourceId: string;
  readonly deleted: boolean;
}

export interface ResourceRegistryStatistics {
  readonly totalResources: number;
  readonly activeResources: number;
  readonly typeCount: number;
  readonly types: readonly string[];
}

export function createResource(input: {
  resourceId: string;
  name: string;
  type: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Resource {
  const now = new Date().toISOString();
  return Object.freeze({
    resourceId: input.resourceId,
    name: input.name.trim(),
    type: input.type.trim(),
    description: (input.description ?? "").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
