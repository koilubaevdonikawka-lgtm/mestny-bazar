import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** Future integration point for dataset version export. Not wired yet. */
export interface IDatasetVersionExportProvider {
  exportTo(datasetVersions: readonly DatasetVersion[]): Promise<string>;
}
