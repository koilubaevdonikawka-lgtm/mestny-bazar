import type { IToolCatalog } from "@server/application/ai-tool-registry/contracts/tool-catalog.contract";
import type { IToolRepository } from "@server/application/ai-tool-registry/contracts/tool-repository.contract";
import type { AiTool } from "@server/application/ai-tool-registry/models/tool.model";

/** Default in-memory tool catalog. */
export class DefaultToolCatalog implements IToolCatalog {
  constructor(private readonly toolRepository: IToolRepository) {}

  async listAll(): Promise<readonly AiTool[]> {
    return Object.freeze(
      [...(await this.toolRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
  }

  async findByName(name: string): Promise<AiTool | null> {
    return this.toolRepository.findByName(name.trim());
  }

  async listByCategory(category: string): Promise<readonly AiTool[]> {
    return Object.freeze(
      [...(await this.toolRepository.findByCategory(category.trim()))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
  }
}
