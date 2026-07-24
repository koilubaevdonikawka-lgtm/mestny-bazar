import type {
  AiTool,
  RegisterToolInput,
  UpdateToolInput,
} from "@server/application/ai-tool-registry/models/tool.model";

export interface IToolValidator {
  validateRegistration(input: RegisterToolInput): void;
  validateUpdate(existing: AiTool, input: UpdateToolInput): void;
}
