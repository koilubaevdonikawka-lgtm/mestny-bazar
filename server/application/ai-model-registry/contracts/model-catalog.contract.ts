import type { Model } from "@server/application/ai-model-registry/models/model.model";

export interface IModelCatalog {
  register(model: Model): Promise<void>;
  remove(modelId: string): Promise<void>;
  findById(modelId: string): Promise<Model | null>;
  findByName(name: string): Promise<Model | null>;
  findByProvider(provider: string): Promise<readonly Model[]>;
  listAll(): Promise<readonly Model[]>;
}
