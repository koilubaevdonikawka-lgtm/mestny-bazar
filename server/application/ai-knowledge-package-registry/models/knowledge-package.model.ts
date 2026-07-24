/** Registered AI knowledge package — generic knowledge package metadata only, no domain knowledge. */
export interface KnowledgePackage {
  readonly knowledgePackageId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterKnowledgePackageInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateKnowledgePackageInput {
  readonly knowledgePackageId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListKnowledgePackagesResult {
  readonly knowledgePackages: readonly KnowledgePackage[];
  readonly total: number;
}

export interface FindKnowledgePackageByNameResult {
  readonly knowledgePackage: KnowledgePackage | null;
}

export interface ListKnowledgePackagesByCategoryResult {
  readonly knowledgePackages: readonly KnowledgePackage[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteKnowledgePackageResult {
  readonly knowledgePackageId: string;
  readonly deleted: boolean;
}

export interface KnowledgePackageRegistryStatistics {
  readonly totalKnowledgePackages: number;
  readonly activeKnowledgePackages: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createKnowledgePackage(input: {
  knowledgePackageId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): KnowledgePackage {
  const now = new Date().toISOString();
  return Object.freeze({
    knowledgePackageId: input.knowledgePackageId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
