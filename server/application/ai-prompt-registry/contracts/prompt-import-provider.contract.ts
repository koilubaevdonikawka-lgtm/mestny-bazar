import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

/** Future integration point for prompt import. Not wired yet. */
export interface IPromptImportProvider {
  importFromSource(source: string): Promise<readonly Prompt[]>;
}
