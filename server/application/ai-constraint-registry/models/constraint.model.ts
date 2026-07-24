/** Registered AI constraint — generic constraint metadata only, no domain knowledge. */
export interface Constraint {
  readonly constraintId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterConstraintInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateConstraintInput {
  readonly constraintId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListConstraintsResult {
  readonly constraints: readonly Constraint[];
  readonly total: number;
}

export interface FindConstraintByNameResult {
  readonly constraint: Constraint | null;
}

export interface ListConstraintsByCategoryResult {
  readonly constraints: readonly Constraint[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteConstraintResult {
  readonly constraintId: string;
  readonly deleted: boolean;
}

export interface ConstraintRegistryStatistics {
  readonly totalConstraints: number;
  readonly activeConstraints: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createConstraint(input: {
  constraintId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Constraint {
  const now = new Date().toISOString();
  return Object.freeze({
    constraintId: input.constraintId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
