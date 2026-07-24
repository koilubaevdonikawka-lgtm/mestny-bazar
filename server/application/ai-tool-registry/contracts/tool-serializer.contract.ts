import type { AiTool } from "@server/application/ai-tool-registry/models/tool.model";

export interface IToolSerializer {
  serialize(tool: AiTool): string;
  deserialize(payload: string): AiTool;
}
