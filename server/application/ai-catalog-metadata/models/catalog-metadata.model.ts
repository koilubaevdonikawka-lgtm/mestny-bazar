/** Registered catalog metadata entry — generic AI metadata only, no domain knowledge. */
export interface CatalogMetadata {
  readonly metadataId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly data: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterCatalogMetadataInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly data?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateCatalogMetadataInput {
  readonly metadataId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly data?: unknown;
  readonly status?: "active" | "inactive";
}

export interface ListCatalogMetadataResult {
  readonly entries: readonly CatalogMetadata[];
  readonly total: number;
}

export interface FindCatalogMetadataByNameResult {
  readonly entry: CatalogMetadata | null;
}

export interface ListCatalogMetadataByCategoryResult {
  readonly entries: readonly CatalogMetadata[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteCatalogMetadataResult {
  readonly metadataId: string;
  readonly deleted: boolean;
}

export interface CatalogMetadataStatistics {
  readonly totalEntries: number;
  readonly activeEntries: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createCatalogMetadata(input: {
  metadataId: string;
  name: string;
  category: string;
  description?: string;
  data?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): CatalogMetadata {
  const now = new Date().toISOString();
  return Object.freeze({
    metadataId: input.metadataId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    data: input.data ?? Object.freeze({}),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
