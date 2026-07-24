import type { AiTool } from "@server/application/ai-tool-registry/models/tool.model";

export interface IToolCatalog {
  listAll(): Promise<readonly AiTool[]>;
  findByName(name: string): Promise<AiTool | null>;
  listByCategory(category: string): Promise<readonly AiTool[]>;
}
