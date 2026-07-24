import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

export interface IDatasetVersionCatalog {
  register(datasetVersion: DatasetVersion): Promise<void>;
  remove(datasetVersionId: string): Promise<void>;
  findById(datasetVersionId: string): Promise<DatasetVersion | null>;
  findByName(name: string): Promise<DatasetVersion | null>;
  findByCategory(category: string): Promise<readonly DatasetVersion[]>;
  listAll(): Promise<readonly DatasetVersion[]>;
}
