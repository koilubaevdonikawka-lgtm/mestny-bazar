import type { Model } from "@server/application/ai-model-registry/models/model.model";

/** Future integration point for model export. Not wired yet. */
export interface IModelExportProvider {
  exportModel(model: Model): Promise<string>;
  exportAll(models: readonly Model[]): Promise<string>;
}
