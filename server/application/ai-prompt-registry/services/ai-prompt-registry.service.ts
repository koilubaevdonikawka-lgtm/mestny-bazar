/**
 * AI Prompt Registry — unified registry for AI prompts.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IPromptCatalog } from "@server/application/ai-prompt-registry/contracts/prompt-catalog.contract";
import type { IPromptRepository } from "@server/application/ai-prompt-registry/contracts/prompt-repository.contract";
import type { IPromptSerializer } from "@server/application/ai-prompt-registry/contracts/prompt-serializer.contract";
import type { IPromptStatisticsProvider } from "@server/application/ai-prompt-registry/contracts/prompt-statistics-provider.contract";
import type { IPromptValidator } from "@server/application/ai-prompt-registry/contracts/prompt-validator.contract";
import {
  createPrompt,
  type DeletePromptResult,
  type FindPromptByNameResult,
  type ListPromptsByCategoryResult,
  type ListPromptsResult,
  type Prompt,
  type PromptRegistryStatistics,
  type RegisterPromptInput,
  type UpdatePromptInput,
} from "@server/application/ai-prompt-registry/models/prompt.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiPromptRegistryService {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly promptCatalog: IPromptCatalog,
    private readonly promptValidator: IPromptValidator,
    private readonly promptSerializer: IPromptSerializer,
    private readonly statisticsProvider: IPromptStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerPrompt(input: RegisterPromptInput): Promise<Prompt> {
    const validation = await this.promptValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.promptRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Prompt already exists with name: ${input.name.trim()}`);
    }

    const prompt = createPrompt({
      promptId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      content: input.content,
      version: input.version,
      status: input.status,
    });

    await this.promptRepository.save(prompt);
    await this.promptCatalog.register(prompt);
    return prompt;
  }

  async getPrompt(promptId: string): Promise<Prompt | null> {
    return this.promptRepository.findById(promptId.trim());
  }

  async listPrompts(): Promise<ListPromptsResult> {
    const prompts = Object.freeze(
      [...(await this.promptRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ prompts, total: prompts.length });
  }

  async updatePrompt(input: UpdatePromptInput): Promise<Prompt> {
    const promptId = input.promptId.trim();
    const existing = await this.promptRepository.findById(promptId);
    if (!existing) {
      throw new Error(`Prompt not found: ${promptId}`);
    }

    const validation = await this.promptValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.promptRepository.findByName(input.name.trim());
      if (duplicate && duplicate.promptId !== existing.promptId) {
        throw new Error(`Prompt already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createPrompt({
      promptId: existing.promptId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      content: input.content?.trim() ?? existing.content,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.promptRepository.save(updated);
    await this.promptCatalog.register(updated);
    return updated;
  }

  async deletePrompt(promptId: string): Promise<DeletePromptResult> {
    const normalizedPromptId = promptId.trim();
    const deleted = await this.promptRepository.delete(normalizedPromptId);
    if (deleted) {
      await this.promptCatalog.remove(normalizedPromptId);
    }
    return Object.freeze({ promptId: normalizedPromptId, deleted });
  }

  async findPromptByName(name: string): Promise<FindPromptByNameResult> {
    const normalizedName = name.trim();
    const prompt = await this.promptRepository.findByName(normalizedName);
    return Object.freeze({ prompt });
  }

  async listPromptsByCategory(category: string): Promise<ListPromptsByCategoryResult> {
    const normalizedCategory = category.trim();
    const prompts = Object.freeze(
      [...(await this.promptRepository.findByCategory(normalizedCategory))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      prompts,
      total: prompts.length,
      category: normalizedCategory,
    });
  }

  async getPromptRegistryStatistics(): Promise<PromptRegistryStatistics> {
    const prompts = await this.promptRepository.findAll();
    const activePrompts = prompts.filter((prompt) => prompt.status === "active").length;
    const categories = Object.freeze([
      ...new Set(prompts.map((prompt) => prompt.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalPrompts: prompts.length,
      activePrompts,
      categories,
    });
  }

  async serializePrompt(prompt: Prompt): Promise<string> {
    return this.promptSerializer.serialize(prompt);
  }

  async deserializePrompt(serialized: string): Promise<Prompt> {
    return this.promptSerializer.deserialize(serialized);
  }
}
