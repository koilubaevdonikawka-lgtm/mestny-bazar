import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

/** Future integration point for prompt version history. Not wired yet. */
export interface IPromptVersionProvider {
  saveVersion(prompt: Prompt): Promise<{ versionId: string }>;
  listVersions(promptId: string): Promise<readonly Prompt[]>;
  restoreVersion(versionId: string): Promise<Prompt | null>;
}
