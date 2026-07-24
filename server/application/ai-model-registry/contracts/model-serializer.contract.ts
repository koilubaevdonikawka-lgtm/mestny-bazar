import type { Model } from "@server/application/ai-model-registry/models/model.model";

export interface IModelSerializer {
  serialize(model: Model): Promise<string>;
  deserialize(serialized: string): Promise<Model>;
}
