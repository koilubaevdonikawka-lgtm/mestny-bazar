import type { IToolRepository } from "@server/application/ai-tool-registry/contracts/tool-repository.contract";
import type { AiTool } from "@server/application/ai-tool-registry/models/tool.model";

/** In-memory AI tool store. */
export class ToolRepository implements IToolRepository {
  private readonly tools = new Map<string, AiTool>();
  private readonly toolsByName = new Map<string, string>();

  async save(tool: AiTool): Promise<void> {
    const existing = this.tools.get(tool.toolId);
    if (existing && existing.name !== tool.name) {
      this.toolsByName.delete(existing.name);
    }

    this.tools.set(tool.toolId, tool);
    this.toolsByName.set(tool.name, tool.toolId);
  }

  async findById(toolId: string): Promise<AiTool | null> {
    return this.tools.get(toolId.trim()) ?? null;
  }

  async findByName(name: string): Promise<AiTool | null> {
    const toolId = this.toolsByName.get(name.trim());
    if (!toolId) {
      return null;
    }
    return this.findById(toolId);
  }

  async findByCategory(category: string): Promise<readonly AiTool[]> {
    const normalizedCategory = category.trim();
    return Object.freeze(
      [...this.tools.values()].filter((tool) => tool.category === normalizedCategory),
    );
  }

  async findAll(): Promise<readonly AiTool[]> {
    return Object.freeze([...this.tools.values()]);
  }

  async delete(toolId: string): Promise<boolean> {
    const tool = await this.findById(toolId);
    if (!tool) {
      return false;
    }
    this.tools.delete(tool.toolId);
    this.toolsByName.delete(tool.name);
    return true;
  }
}
