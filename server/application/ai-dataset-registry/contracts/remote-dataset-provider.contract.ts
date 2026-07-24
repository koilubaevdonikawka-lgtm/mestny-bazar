import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

/** Future integration point for external dataset providers. Not wired yet. */
export interface IRemoteDatasetProvider {
  fetchRemote(datasetId: string): Promise<Dataset | null>;
  pushRemote(dataset: Dataset): Promise<void>;
}
