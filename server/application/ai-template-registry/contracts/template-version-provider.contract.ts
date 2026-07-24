import type { Template } from "@server/application/ai-template-registry/models/template.model";

/** Future integration point for template version management. Not wired yet. */
export interface ITemplateVersionProvider {
  listVersions(templateId: string): Promise<readonly Template[]>;
  getVersion(templateId: string, version: string): Promise<Template | null>;
}
