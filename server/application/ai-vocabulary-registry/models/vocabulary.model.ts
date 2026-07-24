/** Registered AI vocabulary — generic vocabulary metadata only, no domain knowledge. */
export interface Vocabulary {
  readonly vocabularyId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterVocabularyInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateVocabularyInput {
  readonly vocabularyId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListVocabulariesResult {
  readonly vocabularies: readonly Vocabulary[];
  readonly total: number;
}

export interface FindVocabularyByNameResult {
  readonly vocabulary: Vocabulary | null;
}

export interface ListVocabulariesByCategoryResult {
  readonly vocabularies: readonly Vocabulary[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteVocabularyResult {
  readonly vocabularyId: string;
  readonly deleted: boolean;
}

export interface VocabularyRegistryStatistics {
  readonly totalVocabularies: number;
  readonly activeVocabularies: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createVocabulary(input: {
  vocabularyId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Vocabulary {
  const now = new Date().toISOString();
  return Object.freeze({
    vocabularyId: input.vocabularyId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
