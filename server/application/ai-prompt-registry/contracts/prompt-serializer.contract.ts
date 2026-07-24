import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

export interface IPromptSerializer {
  serialize(prompt: Prompt): Promise<string>;
  deserialize(serialized: string): Promise<Prompt>;
}
