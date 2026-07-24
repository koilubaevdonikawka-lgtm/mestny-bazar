/** Registered AI entity — generic entity metadata only, no domain knowledge. */
export interface Entity {
  readonly entityId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterEntityInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateEntityInput {
  readonly entityId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListEntitiesResult {
  readonly entities: readonly Entity[];
  readonly total: number;
}

export interface FindEntityByNameResult {
  readonly entity: Entity | null;
}

export interface ListEntitiesByCategoryResult {
  readonly entities: readonly Entity[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteEntityResult {
  readonly entityId: string;
  readonly deleted: boolean;
}

export interface EntityRegistryStatistics {
  readonly totalEntities: number;
  readonly activeEntities: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createEntity(input: {
  entityId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Entity {
  const now = new Date().toISOString();
  return Object.freeze({
    entityId: input.entityId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
