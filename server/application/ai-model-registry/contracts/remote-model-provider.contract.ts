import type { Model } from "@server/application/ai-model-registry/models/model.model";

/** Future integration point for external model providers. Not wired yet. */
export interface IRemoteModelProvider {
  fetchRemote(modelId: string): Promise<Model | null>;
  pushRemote(model: Model): Promise<void>;
}
