import type { ValidateAgentActionInput } from "@server/application/ai-action-security/models/security-policy.model";

export interface IAgentActionValidator {
  validate(input: ValidateAgentActionInput): void;
}
