/**
 * Future integration ports for AI Action Security.
 * Not implemented — reserved for external policy engines.
 */

import type {
  SecurityPolicy,
  ValidateAgentActionInput,
} from "@server/application/ai-action-security/models/security-policy.model";
import type { SecurityDecision } from "@server/application/ai-action-security/contracts/security-decision-engine.contract";

/** Policy Engine Provider — external policy engine integration. */
export interface IPolicyEngineProvider {
  evaluate(input: ValidateAgentActionInput, policies: readonly SecurityPolicy[]): Promise<SecurityDecision>;
}

/** OPA Provider — Open Policy Agent integration. */
export interface IOpaProvider {
  evaluatePolicy(input: ValidateAgentActionInput): Promise<SecurityDecision>;
}

/** Rego Policy Provider — Rego policy language integration. */
export interface IRegoPolicyProvider {
  evaluateRego(input: ValidateAgentActionInput, regoSource: string): Promise<SecurityDecision>;
}

/** Remote Security Provider — remote security service integration. */
export interface IRemoteSecurityProvider {
  validateRemote(input: ValidateAgentActionInput): Promise<SecurityDecision>;
}

/** Agent Permission Provider — agent permission lookup integration. */
export interface IAgentPermissionProvider {
  hasPermission(agentId: string, actionName: string): Promise<boolean>;
}
