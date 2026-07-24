import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

/** Future integration point for dataset import. Not wired yet. */
export interface IDatasetImportProvider {
  importFrom(source: string): Promise<readonly Dataset[]>;
}
