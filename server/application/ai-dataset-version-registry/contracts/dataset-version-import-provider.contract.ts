import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** Future integration point for dataset version import. Not wired yet. */
export interface IDatasetVersionImportProvider {
  importFrom(source: string): Promise<readonly DatasetVersion[]>;
}
