import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

/** Future integration point for prompt export. Not wired yet. */
export interface IPromptExportProvider {
  exportPrompt(prompt: Prompt): Promise<string>;
  exportAll(prompts: readonly Prompt[]): Promise<string>;
}
