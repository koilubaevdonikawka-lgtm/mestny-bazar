import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** Future integration point for dataset version synchronization. Not wired yet. */
export interface IDatasetVersionSynchronizationProvider {
  synchronize(datasetVersions: readonly DatasetVersion[]): Promise<void>;
}
