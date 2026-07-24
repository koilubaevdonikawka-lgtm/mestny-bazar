import type { IAgentActionValidator } from "@server/application/ai-action-security/contracts/agent-action-validator.contract";
import type { ValidateAgentActionInput } from "@server/application/ai-action-security/models/security-policy.model";

/** Default agent action input validator. */
export class DefaultAgentActionValidator implements IAgentActionValidator {
  validate(input: ValidateAgentActionInput): void {
    const actionName = input.actionName.trim();
    if (!actionName) {
      throw new Error("Action name is required.");
    }
    if (actionName.length > 256) {
      throw new Error("Action name must not exceed 256 characters.");
    }
  }
}
