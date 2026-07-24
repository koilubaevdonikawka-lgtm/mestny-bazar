import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

export interface IDatasetRepository {
  save(dataset: Dataset): Promise<void>;
  findById(datasetId: string): Promise<Dataset | null>;
  findByName(name: string): Promise<Dataset | null>;
  findByCategory(category: string): Promise<readonly Dataset[]>;
  findAll(): Promise<readonly Dataset[]>;
  delete(datasetId: string): Promise<boolean>;
}
