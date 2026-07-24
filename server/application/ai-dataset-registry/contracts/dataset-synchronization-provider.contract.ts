import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

/** Future integration point for dataset synchronization. Not wired yet. */
export interface IDatasetSynchronizationProvider {
  synchronize(datasets: readonly Dataset[]): Promise<void>;
}
