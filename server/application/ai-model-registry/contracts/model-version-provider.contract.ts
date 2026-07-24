import type { Model } from "@server/application/ai-model-registry/models/model.model";

/** Future integration point for model version history. Not wired yet. */
export interface IModelVersionProvider {
  saveVersion(model: Model): Promise<{ versionId: string }>;
  listVersions(modelId: string): Promise<readonly Model[]>;
  restoreVersion(versionId: string): Promise<Model | null>;
}
