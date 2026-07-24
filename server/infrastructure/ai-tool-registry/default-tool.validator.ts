import type { IToolValidator } from "@server/application/ai-tool-registry/contracts/tool-validator.contract";
import type {
  AiTool,
  RegisterToolInput,
  UpdateToolInput,
} from "@server/application/ai-tool-registry/models/tool.model";

/** Default tool validator — name and input constraints. */
export class DefaultToolValidator implements IToolValidator {
  validateName(name: string): void {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error("Tool name is required.");
    }
    if (normalizedName.length > 128) {
      throw new Error("Tool name must not exceed 128 characters.");
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(normalizedName)) {
      throw new Error(
        "Tool name may only contain letters, numbers, dots, underscores, and hyphens.",
      );
    }
  }

  validateRegistration(input: RegisterToolInput): void {
    this.validateName(input.name);
  }

  validateUpdate(_existing: AiTool, input: UpdateToolInput): void {
    if (input.name !== undefined) {
      this.validateName(input.name);
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      throw new Error("Tool status must be 'active' or 'inactive'.");
    }
  }
}
