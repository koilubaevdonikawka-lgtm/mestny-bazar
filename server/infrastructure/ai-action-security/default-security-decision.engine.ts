import type {
  ISecurityDecisionEngine,
  SecurityDecision,
} from "@server/application/ai-action-security/contracts/security-decision-engine.contract";
import type {
  SecurityPolicy,
  ValidateAgentActionInput,
} from "@server/application/ai-action-security/models/security-policy.model";

/** Default mock security decision engine — local rules only, no external services. */
export class DefaultSecurityDecisionEngine implements ISecurityDecisionEngine {
  async decide(
    input: ValidateAgentActionInput,
    policies: readonly SecurityPolicy[],
  ): Promise<SecurityDecision> {
    const actionName = input.actionName.trim();

    if (actionName.startsWith("blocked.")) {
      return Object.freeze({
        allowed: false,
        reason: "Action matches mock blocked prefix rule.",
        policyId: null,
        mock: true,
      });
    }

    if (this.payloadContainsForbidden(input.payload)) {
      return Object.freeze({
        allowed: false,
        reason: "Payload contains forbidden mock keyword.",
        policyId: null,
        mock: true,
      });
    }

    for (const policy of policies) {
      if (policy.status !== "active") {
        continue;
      }

      const blocked = policy.rules.blockedActions ?? [];
      if (blocked.includes(actionName)) {
        return Object.freeze({
          allowed: false,
          reason: `Action blocked by policy: ${policy.name}`,
          policyId: policy.policyId,
          mock: true,
        });
      }

      for (const pattern of policy.rules.blockedPatterns ?? []) {
        if (actionName.includes(pattern)) {
          return Object.freeze({
            allowed: false,
            reason: `Action matches blocked pattern in policy: ${policy.name}`,
            policyId: policy.policyId,
            mock: true,
          });
        }
      }

      const allowedActions = policy.rules.allowedActions ?? [];
      if (allowedActions.length > 0 && !allowedActions.includes(actionName)) {
        return Object.freeze({
          allowed: false,
          reason: `Action not in allowed list for policy: ${policy.name}`,
          policyId: policy.policyId,
          mock: true,
        });
      }
    }

    return Object.freeze({
      allowed: true,
      reason: "Action allowed by mock local security rules.",
      policyId: policies[0]?.policyId ?? null,
      mock: true,
    });
  }

  private payloadContainsForbidden(payload: unknown): boolean {
    if (payload === null || payload === undefined) {
      return false;
    }
    if (typeof payload === "string") {
      return payload.toLowerCase().includes("forbidden");
    }
    if (typeof payload === "object") {
      return JSON.stringify(payload).toLowerCase().includes("forbidden");
    }
    return false;
  }
}
