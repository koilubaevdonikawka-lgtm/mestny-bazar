import type { Template } from "@server/application/ai-template-registry/models/template.model";

/** Future integration point for template import. Not wired yet. */
export interface ITemplateImportProvider {
  importFrom(source: string): Promise<readonly Template[]>;
}
