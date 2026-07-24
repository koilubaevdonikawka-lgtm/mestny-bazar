import type { Model } from "@server/application/ai-model-registry/models/model.model";

/** Future integration point for model import. Not wired yet. */
export interface IModelImportProvider {
  importFromSource(source: string): Promise<readonly Model[]>;
}
