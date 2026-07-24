/** Registered knowledge source — generic knowledge metadata only, no domain knowledge. */
export interface KnowledgeSource {
  readonly knowledgeId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly data: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterKnowledgeSourceInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly data?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateKnowledgeSourceInput {
  readonly knowledgeId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly data?: unknown;
  readonly status?: "active" | "inactive";
}

export interface ListKnowledgeSourcesResult {
  readonly sources: readonly KnowledgeSource[];
  readonly total: number;
}

export interface FindKnowledgeSourceByNameResult {
  readonly source: KnowledgeSource | null;
}

export interface ListKnowledgeSourcesByCategoryResult {
  readonly sources: readonly KnowledgeSource[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteKnowledgeSourceResult {
  readonly knowledgeId: string;
  readonly deleted: boolean;
}

export interface KnowledgeRegistryStatistics {
  readonly totalSources: number;
  readonly activeSources: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createKnowledgeSource(input: {
  knowledgeId: string;
  name: string;
  category: string;
  description?: string;
  data?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): KnowledgeSource {
  const now = new Date().toISOString();
  return Object.freeze({
    knowledgeId: input.knowledgeId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    data: input.data ?? Object.freeze({}),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
