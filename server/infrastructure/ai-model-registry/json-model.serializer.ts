import type { IModelSerializer } from "@server/application/ai-model-registry/contracts/model-serializer.contract";
import {
  createModel,
  type Model,
} from "@server/application/ai-model-registry/models/model.model";

/** JSON-based model serializer. */
export class JsonModelSerializer implements IModelSerializer {
  async serialize(model: Model): Promise<string> {
    return JSON.stringify(model);
  }

  async deserialize(serialized: string): Promise<Model> {
    if (!serialized.trim()) {
      throw new Error("Serialized model cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Model>;
    return createModel({
      modelId: parsed.modelId ?? "",
      name: parsed.name ?? "",
      provider: parsed.provider ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
