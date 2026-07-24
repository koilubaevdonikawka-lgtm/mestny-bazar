import type { Template } from "@server/application/ai-template-registry/models/template.model";

/** Future integration point for template synchronization. Not wired yet. */
export interface ITemplateSynchronizationProvider {
  synchronize(templates: readonly Template[]): Promise<void>;
}
