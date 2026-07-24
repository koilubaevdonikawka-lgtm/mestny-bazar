import type { Template } from "@server/application/ai-template-registry/models/template.model";

/** Future integration point for template export. Not wired yet. */
export interface ITemplateExportProvider {
  exportTo(templates: readonly Template[]): Promise<string>;
}
