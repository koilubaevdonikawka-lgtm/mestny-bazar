import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** Future integration point for external dataset version providers. Not wired yet. */
export interface IRemoteDatasetVersionProvider {
  fetchRemote(datasetVersionId: string): Promise<DatasetVersion | null>;
  pushRemote(datasetVersion: DatasetVersion): Promise<void>;
}
