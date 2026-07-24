import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

export interface IPromptCatalog {
  register(prompt: Prompt): Promise<void>;
  remove(promptId: string): Promise<void>;
  findById(promptId: string): Promise<Prompt | null>;
  findByName(name: string): Promise<Prompt | null>;
  findByCategory(category: string): Promise<readonly Prompt[]>;
  listAll(): Promise<readonly Prompt[]>;
}
