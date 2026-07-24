/**
 * AI Tool Registry — unified registry of tools available to AI agents.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IToolCatalog } from "@server/application/ai-tool-registry/contracts/tool-catalog.contract";
import type { IToolRepository } from "@server/application/ai-tool-registry/contracts/tool-repository.contract";
import type { IToolSerializer } from "@server/application/ai-tool-registry/contracts/tool-serializer.contract";
import type { IToolStatisticsProvider } from "@server/application/ai-tool-registry/contracts/tool-statistics-provider.contract";
import type { IToolValidator } from "@server/application/ai-tool-registry/contracts/tool-validator.contract";
import {
  createAiTool,
  normalizeToolCategory,
  type AiTool,
  type DeleteToolResult,
  type FindToolByNameResult,
  type ListToolsByCategoryResult,
  type ListToolsResult,
  type RegisterToolInput,
  type ToolRegistryStatistics,
  type UpdateToolInput,
} from "@server/application/ai-tool-registry/models/tool.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiToolRegistryService {
  constructor(
    private readonly toolRepository: IToolRepository,
    private readonly toolCatalog: IToolCatalog,
    private readonly toolValidator: IToolValidator,
    private readonly toolSerializer: IToolSerializer,
    private readonly statisticsProvider: IToolStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerTool(input: RegisterToolInput): Promise<AiTool> {
    this.toolValidator.validateRegistration(input);

    const name = input.name.trim();
    if (await this.toolRepository.findByName(name)) {
      throw new Error(`Tool already exists: ${name}`);
    }

    const tool = createAiTool({
      toolId: this.idGenerator.generate(),
      name,
      description: input.description,
      category: input.category,
      schema: input.schema,
      status: input.status,
    });

    await this.toolRepository.save(tool);
    return tool;
  }

  async getTool(toolId: string): Promise<AiTool | null> {
    return this.toolRepository.findById(toolId.trim());
  }

  async listTools(): Promise<ListToolsResult> {
    const tools = Object.freeze([...(await this.toolCatalog.listAll())]);
    return Object.freeze({ tools, total: tools.length });
  }

  async updateTool(input: UpdateToolInput): Promise<AiTool> {
    const toolId = input.toolId.trim();
    const existing = await this.toolRepository.findById(toolId);
    if (!existing) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    this.toolValidator.validateUpdate(existing, input);

    const nextName = input.name?.trim() ?? existing.name;
    if (nextName !== existing.name && (await this.toolRepository.findByName(nextName))) {
      throw new Error(`Tool already exists: ${nextName}`);
    }

    const updated = createAiTool({
      toolId: existing.toolId,
      name: nextName,
      description: input.description ?? existing.description,
      category: input.category ?? existing.category,
      schema: input.schema ?? existing.schema,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.toolRepository.save(updated);
    return updated;
  }

  async deleteTool(toolId: string): Promise<DeleteToolResult> {
    const normalizedToolId = toolId.trim();
    const deleted = await this.toolRepository.delete(normalizedToolId);
    return Object.freeze({ toolId: normalizedToolId, deleted });
  }

  async findToolByName(name: string): Promise<FindToolByNameResult> {
    const normalizedName = name.trim();
    const tool = await this.toolCatalog.findByName(normalizedName);
    return Object.freeze({ name: normalizedName, tool });
  }

  async listToolsByCategory(category: string): Promise<ListToolsByCategoryResult> {
    const normalizedCategory = normalizeToolCategory(category);
    const tools = Object.freeze([...(await this.toolCatalog.listByCategory(normalizedCategory))]);
    return Object.freeze({
      category: normalizedCategory,
      tools,
      total: tools.length,
    });
  }

  async getToolRegistryStatistics(): Promise<ToolRegistryStatistics> {
    const tools = await this.toolRepository.findAll();
    const categories = new Set(tools.map((tool) => tool.category));
    const activeTools = tools.filter((tool) => tool.status === "active").length;
    const inactiveTools = tools.filter((tool) => tool.status === "inactive").length;

    return this.statisticsProvider.getStatistics({
      totalTools: tools.length,
      totalCategories: categories.size,
      activeTools,
      inactiveTools,
    });
  }

  serializeToolDescription(tool: AiTool): string {
    return this.toolSerializer.serialize(tool);
  }
}
