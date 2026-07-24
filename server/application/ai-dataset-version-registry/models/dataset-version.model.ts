/** Registered AI dataset version — generic dataset version metadata only, no domain knowledge. */
export interface DatasetVersion {
  readonly datasetVersionId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterDatasetVersionInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateDatasetVersionInput {
  readonly datasetVersionId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListDatasetVersionsResult {
  readonly datasetVersions: readonly DatasetVersion[];
  readonly total: number;
}

export interface FindDatasetVersionByNameResult {
  readonly datasetVersion: DatasetVersion | null;
}

export interface ListDatasetVersionsByCategoryResult {
  readonly datasetVersions: readonly DatasetVersion[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteDatasetVersionResult {
  readonly datasetVersionId: string;
  readonly deleted: boolean;
}

export interface DatasetVersionRegistryStatistics {
  readonly totalDatasetVersions: number;
  readonly activeDatasetVersions: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createDatasetVersion(input: {
  datasetVersionId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): DatasetVersion {
  const now = new Date().toISOString();
  return Object.freeze({
    datasetVersionId: input.datasetVersionId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
