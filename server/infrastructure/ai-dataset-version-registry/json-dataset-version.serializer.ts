import type { IDatasetVersionSerializer } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-serializer.contract";
import {
  createDatasetVersion,
  type DatasetVersion,
} from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** JSON-based dataset version serializer. */
export class JsonDatasetVersionSerializer implements IDatasetVersionSerializer {
  async serialize(datasetVersion: DatasetVersion): Promise<string> {
    return JSON.stringify(datasetVersion);
  }

  async deserialize(serialized: string): Promise<DatasetVersion> {
    if (!serialized.trim()) {
      throw new Error("Serialized dataset version cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<DatasetVersion>;
    return createDatasetVersion({
      datasetVersionId: parsed.datasetVersionId ?? "",
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
