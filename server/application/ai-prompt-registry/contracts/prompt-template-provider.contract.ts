import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

/** Future integration point for prompt templates. Not wired yet. */
export interface IPromptTemplateProvider {
  listTemplates(): Promise<readonly string[]>;
  applyTemplate(templateId: string): Promise<Partial<Prompt>>;
}
