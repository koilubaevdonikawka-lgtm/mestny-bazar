import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

export interface IDatasetCatalog {
  register(dataset: Dataset): Promise<void>;
  remove(datasetId: string): Promise<void>;
  findById(datasetId: string): Promise<Dataset | null>;
  findByName(name: string): Promise<Dataset | null>;
  findByCategory(category: string): Promise<readonly Dataset[]>;
  listAll(): Promise<readonly Dataset[]>;
}
