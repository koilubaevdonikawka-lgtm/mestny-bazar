import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

/** Future integration point for dataset version management. Not wired yet. */
export interface IDatasetVersionProvider {
  listVersions(datasetId: string): Promise<readonly Dataset[]>;
  getVersion(datasetId: string, version: string): Promise<Dataset | null>;
}
