/** Registered AI taxonomy — generic taxonomy metadata only, no domain knowledge. */
export interface Taxonomy {
  readonly taxonomyId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterTaxonomyInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateTaxonomyInput {
  readonly taxonomyId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListTaxonomiesResult {
  readonly taxonomies: readonly Taxonomy[];
  readonly total: number;
}

export interface FindTaxonomyByNameResult {
  readonly taxonomy: Taxonomy | null;
}

export interface ListTaxonomiesByCategoryResult {
  readonly taxonomies: readonly Taxonomy[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteTaxonomyResult {
  readonly taxonomyId: string;
  readonly deleted: boolean;
}

export interface TaxonomyRegistryStatistics {
  readonly totalTaxonomies: number;
  readonly activeTaxonomies: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createTaxonomy(input: {
  taxonomyId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Taxonomy {
  const now = new Date().toISOString();
  return Object.freeze({
    taxonomyId: input.taxonomyId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
