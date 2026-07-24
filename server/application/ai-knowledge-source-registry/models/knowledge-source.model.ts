/** Registered AI knowledge source — generic knowledge source metadata only, no domain knowledge. */
export interface KnowledgeSource {
  readonly knowledgeSourceId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterKnowledgeSourceInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateKnowledgeSourceInput {
  readonly knowledgeSourceId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListKnowledgeSourcesResult {
  readonly knowledgeSources: readonly KnowledgeSource[];
  readonly total: number;
}

export interface FindKnowledgeSourceByNameResult {
  readonly knowledgeSource: KnowledgeSource | null;
}

export interface ListKnowledgeSourcesByCategoryResult {
  readonly knowledgeSources: readonly KnowledgeSource[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteKnowledgeSourceResult {
  readonly knowledgeSourceId: string;
  readonly deleted: boolean;
}

export interface KnowledgeSourceRegistryStatistics {
  readonly totalKnowledgeSources: number;
  readonly activeKnowledgeSources: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createKnowledgeSource(input: {
  knowledgeSourceId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): KnowledgeSource {
  const now = new Date().toISOString();
  return Object.freeze({
    knowledgeSourceId: input.knowledgeSourceId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
