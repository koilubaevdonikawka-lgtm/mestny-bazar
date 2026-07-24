import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

export interface IPromptRepository {
  save(prompt: Prompt): Promise<void>;
  findById(promptId: string): Promise<Prompt | null>;
  findByName(name: string): Promise<Prompt | null>;
  findByCategory(category: string): Promise<readonly Prompt[]>;
  findAll(): Promise<readonly Prompt[]>;
  delete(promptId: string): Promise<boolean>;
}
