/**
 * AI Context Management — unified management for AI context.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IContextCatalog } from "@server/application/ai-context-management/contracts/context-catalog.contract";
import type { IContextRepository } from "@server/application/ai-context-management/contracts/context-repository.contract";
import type { IContextSerializer } from "@server/application/ai-context-management/contracts/context-serializer.contract";
import type { IContextStatisticsProvider } from "@server/application/ai-context-management/contracts/context-statistics-provider.contract";
import type { IContextValidator } from "@server/application/ai-context-management/contracts/context-validator.contract";
import {
  createContext,
  type Context,
  type ContextStatistics,
  type CreateContextInput,
  type DeleteContextResult,
  type FindContextByNameResult,
  type ListContextsByCategoryResult,
  type ListContextsResult,
  type UpdateContextInput,
} from "@server/application/ai-context-management/models/context.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiContextManagementService {
  constructor(
    private readonly contextRepository: IContextRepository,
    private readonly contextCatalog: IContextCatalog,
    private readonly contextValidator: IContextValidator,
    private readonly contextSerializer: IContextSerializer,
    private readonly statisticsProvider: IContextStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createContext(input: CreateContextInput): Promise<Context> {
    const validation = await this.contextValidator.validateCreation(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.contextRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Context already exists with name: ${input.name.trim()}`);
    }

    const context = createContext({
      contextId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      content: input.content,
      status: input.status,
    });

    await this.contextRepository.save(context);
    await this.contextCatalog.register(context);
    return context;
  }

  async getContext(contextId: string): Promise<Context | null> {
    return this.contextRepository.findById(contextId.trim());
  }

  async listContexts(): Promise<ListContextsResult> {
    const contexts = Object.freeze(
      [...(await this.contextRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ contexts, total: contexts.length });
  }

  async updateContext(input: UpdateContextInput): Promise<Context> {
    const contextId = input.contextId.trim();
    const existing = await this.contextRepository.findById(contextId);
    if (!existing) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const validation = await this.contextValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.contextRepository.findByName(input.name.trim());
      if (duplicate && duplicate.contextId !== existing.contextId) {
        throw new Error(`Context already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createContext({
      contextId: existing.contextId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      content: input.content?.trim() ?? existing.content,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.contextRepository.save(updated);
    await this.contextCatalog.register(updated);
    return updated;
  }

  async deleteContext(contextId: string): Promise<DeleteContextResult> {
    const normalizedContextId = contextId.trim();
    const deleted = await this.contextRepository.delete(normalizedContextId);
    if (deleted) {
      await this.contextCatalog.remove(normalizedContextId);
    }
    return Object.freeze({ contextId: normalizedContextId, deleted });
  }

  async findContextByName(name: string): Promise<FindContextByNameResult> {
    const normalizedName = name.trim();
    const context = await this.contextRepository.findByName(normalizedName);
    return Object.freeze({ context });
  }

  async listContextsByCategory(category: string): Promise<ListContextsByCategoryResult> {
    const normalizedCategory = category.trim();
    const contexts = Object.freeze(
      [...(await this.contextRepository.findByCategory(normalizedCategory))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      contexts,
      total: contexts.length,
      category: normalizedCategory,
    });
  }

  async getContextStatistics(): Promise<ContextStatistics> {
    const contexts = await this.contextRepository.findAll();
    const activeContexts = contexts.filter((context) => context.status === "active").length;
    const categories = Object.freeze([
      ...new Set(contexts.map((context) => context.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalContexts: contexts.length,
      activeContexts,
      categories,
    });
  }

  async serializeContext(context: Context): Promise<string> {
    return this.contextSerializer.serialize(context);
  }

  async deserializeContext(serialized: string): Promise<Context> {
    return this.contextSerializer.deserialize(serialized);
  }
}
