import type { Template } from "@server/application/ai-template-registry/models/template.model";

/** Future integration point for external template providers. Not wired yet. */
export interface IRemoteTemplateProvider {
  fetchRemote(templateId: string): Promise<Template | null>;
  pushRemote(template: Template): Promise<void>;
}
