import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

/** Future integration point for dataset export. Not wired yet. */
export interface IDatasetExportProvider {
  exportTo(datasets: readonly Dataset[]): Promise<string>;
}
