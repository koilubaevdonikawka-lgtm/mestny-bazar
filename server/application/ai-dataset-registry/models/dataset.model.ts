/** Registered AI dataset — generic dataset metadata only, no domain knowledge. */
export interface Dataset {
  readonly datasetId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterDatasetInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateDatasetInput {
  readonly datasetId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListDatasetsResult {
  readonly datasets: readonly Dataset[];
  readonly total: number;
}

export interface FindDatasetByNameResult {
  readonly dataset: Dataset | null;
}

export interface ListDatasetsByCategoryResult {
  readonly datasets: readonly Dataset[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteDatasetResult {
  readonly datasetId: string;
  readonly deleted: boolean;
}

export interface DatasetRegistryStatistics {
  readonly totalDatasets: number;
  readonly activeDatasets: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createDataset(input: {
  datasetId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Dataset {
  const now = new Date().toISOString();
  return Object.freeze({
    datasetId: input.datasetId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
