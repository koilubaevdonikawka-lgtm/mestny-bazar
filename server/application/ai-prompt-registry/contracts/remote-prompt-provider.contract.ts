import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

/** Future integration point for external prompt registries. Not wired yet. */
export interface IRemotePromptProvider {
  fetchRemote(promptId: string): Promise<Prompt | null>;
  pushRemote(prompt: Prompt): Promise<void>;
}
