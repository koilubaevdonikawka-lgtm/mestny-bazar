/** Registered AI relation — generic relation metadata only, no domain knowledge. */
export interface Relation {
  readonly relationId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterRelationInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateRelationInput {
  readonly relationId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListRelationsResult {
  readonly relations: readonly Relation[];
  readonly total: number;
}

export interface FindRelationByNameResult {
  readonly relation: Relation | null;
}

export interface ListRelationsByCategoryResult {
  readonly relations: readonly Relation[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteRelationResult {
  readonly relationId: string;
  readonly deleted: boolean;
}

export interface RelationRegistryStatistics {
  readonly totalRelations: number;
  readonly activeRelations: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createRelation(input: {
  relationId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Relation {
  const now = new Date().toISOString();
  return Object.freeze({
    relationId: input.relationId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
