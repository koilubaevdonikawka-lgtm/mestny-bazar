import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

export interface IDatasetVersionSerializer {
  serialize(datasetVersion: DatasetVersion): Promise<string>;
  deserialize(serialized: string): Promise<DatasetVersion>;
}
