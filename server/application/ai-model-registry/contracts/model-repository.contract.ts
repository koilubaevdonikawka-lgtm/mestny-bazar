import type { Model } from "@server/application/ai-model-registry/models/model.model";

export interface IModelRepository {
  save(model: Model): Promise<void>;
  findById(modelId: string): Promise<Model | null>;
  findByName(name: string): Promise<Model | null>;
  findByProvider(provider: string): Promise<readonly Model[]>;
  findAll(): Promise<readonly Model[]>;
  delete(modelId: string): Promise<boolean>;
}
