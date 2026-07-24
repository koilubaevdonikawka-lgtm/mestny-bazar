import type { IDatasetSerializer } from "@server/application/ai-dataset-registry/contracts/dataset-serializer.contract";
import {
  createDataset,
  type Dataset,
} from "@server/application/ai-dataset-registry/models/dataset.model";

/** JSON-based dataset serializer. */
export class JsonDatasetSerializer implements IDatasetSerializer {
  async serialize(dataset: Dataset): Promise<string> {
    return JSON.stringify(dataset);
  }

  async deserialize(serialized: string): Promise<Dataset> {
    if (!serialized.trim()) {
      throw new Error("Serialized dataset cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Dataset>;
    return createDataset({
      datasetId: parsed.datasetId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
