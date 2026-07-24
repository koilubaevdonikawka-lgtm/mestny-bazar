/** Registered AI knowledge graph — generic knowledge graph metadata only, no domain knowledge. */
export interface KnowledgeGraph {
  readonly knowledgeGraphId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterKnowledgeGraphInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateKnowledgeGraphInput {
  readonly knowledgeGraphId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListKnowledgeGraphsResult {
  readonly knowledgeGraphs: readonly KnowledgeGraph[];
  readonly total: number;
}

export interface FindKnowledgeGraphByNameResult {
  readonly knowledgeGraph: KnowledgeGraph | null;
}

export interface ListKnowledgeGraphsByCategoryResult {
  readonly knowledgeGraphs: readonly KnowledgeGraph[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteKnowledgeGraphResult {
  readonly knowledgeGraphId: string;
  readonly deleted: boolean;
}

export interface KnowledgeGraphRegistryStatistics {
  readonly totalKnowledgeGraphs: number;
  readonly activeKnowledgeGraphs: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createKnowledgeGraph(input: {
  knowledgeGraphId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): KnowledgeGraph {
  const now = new Date().toISOString();
  return Object.freeze({
    knowledgeGraphId: input.knowledgeGraphId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
