import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

export interface IDatasetVersionRepository {
  save(datasetVersion: DatasetVersion): Promise<void>;
  findById(datasetVersionId: string): Promise<DatasetVersion | null>;
  findByName(name: string): Promise<DatasetVersion | null>;
  findByCategory(category: string): Promise<readonly DatasetVersion[]>;
  findAll(): Promise<readonly DatasetVersion[]>;
  delete(datasetVersionId: string): Promise<boolean>;
}
