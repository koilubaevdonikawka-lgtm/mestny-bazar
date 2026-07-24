/** Registered AI concept — generic concept metadata only, no domain knowledge. */
export interface Concept {
  readonly conceptId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterConceptInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateConceptInput {
  readonly conceptId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListConceptsResult {
  readonly concepts: readonly Concept[];
  readonly total: number;
}

export interface FindConceptByNameResult {
  readonly concept: Concept | null;
}

export interface ListConceptsByCategoryResult {
  readonly concepts: readonly Concept[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteConceptResult {
  readonly conceptId: string;
  readonly deleted: boolean;
}

export interface ConceptRegistryStatistics {
  readonly totalConcepts: number;
  readonly activeConcepts: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createConcept(input: {
  conceptId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Concept {
  const now = new Date().toISOString();
  return Object.freeze({
    conceptId: input.conceptId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
