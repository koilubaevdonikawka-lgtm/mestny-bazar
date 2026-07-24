import type {
  SecurityPolicy,
  ValidateAgentActionInput,
} from "@server/application/ai-action-security/models/security-policy.model";

export interface SecurityDecision {
  readonly allowed: boolean;
  readonly reason: string;
  readonly policyId: string | null;
  readonly mock: boolean;
}

export interface ISecurityDecisionEngine {
  decide(
    input: ValidateAgentActionInput,
    policies: readonly SecurityPolicy[],
  ): Promise<SecurityDecision>;
}
