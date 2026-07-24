import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

export interface IDatasetSerializer {
  serialize(dataset: Dataset): Promise<string>;
  deserialize(serialized: string): Promise<Dataset>;
}
