import type { AiTool } from "@server/application/ai-tool-registry/models/tool.model";

export interface IToolRepository {
  save(tool: AiTool): Promise<void>;
  findById(toolId: string): Promise<AiTool | null>;
  findByName(name: string): Promise<AiTool | null>;
  findByCategory(category: string): Promise<readonly AiTool[]>;
  findAll(): Promise<readonly AiTool[]>;
  delete(toolId: string): Promise<boolean>;
}
