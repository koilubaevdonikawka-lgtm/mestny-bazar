import type { IPromptCatalog } from "@server/application/ai-prompt-registry/contracts/prompt-catalog.contract";
import type { Prompt } from "@server/application/ai-prompt-registry/models/prompt.model";

/** Default in-memory prompt catalog index. */
export class DefaultPromptCatalog implements IPromptCatalog {
  private readonly prompts = new Map<string, Prompt>();
  private readonly promptsByName = new Map<string, string>();
  private readonly promptsByCategory = new Map<string, Set<string>>();

  async register(prompt: Prompt): Promise<void> {
    const existing = this.prompts.get(prompt.promptId);
    if (existing) {
      if (existing.name !== prompt.name) {
        this.promptsByName.delete(existing.name);
      }
      if (existing.category !== prompt.category) {
        this.removeFromCategory(existing.category, existing.promptId);
      }
    }

    this.prompts.set(prompt.promptId, prompt);
    this.promptsByName.set(prompt.name, prompt.promptId);
    this.addToCategory(prompt.category, prompt.promptId);
  }

  async remove(promptId: string): Promise<void> {
    const prompt = this.prompts.get(promptId.trim());
    if (!prompt) {
      return;
    }
    this.prompts.delete(prompt.promptId);
    this.promptsByName.delete(prompt.name);
    this.removeFromCategory(prompt.category, prompt.promptId);
  }

  async findById(promptId: string): Promise<Prompt | null> {
    return this.prompts.get(promptId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Prompt | null> {
    const promptId = this.promptsByName.get(name.trim());
    if (!promptId) {
      return null;
    }
    return this.prompts.get(promptId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Prompt[]> {
    const promptIds = this.promptsByCategory.get(category.trim());
    if (!promptIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...promptIds]
        .map((promptId) => this.prompts.get(promptId))
        .filter((prompt): prompt is Prompt => prompt !== undefined),
    );
  }

  async listAll(): Promise<readonly Prompt[]> {
    return Object.freeze([...this.prompts.values()]);
  }

  private addToCategory(category: string, promptId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.promptsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(promptId);
    this.promptsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, promptId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.promptsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(promptId);
    if (categorySet.size === 0) {
      this.promptsByCategory.delete(normalizedCategory);
    }
  }
}
