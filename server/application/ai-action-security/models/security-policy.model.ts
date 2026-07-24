/** Security policy for AI action validation — no domain knowledge. */
export interface SecurityPolicy {
  readonly policyId: string;
  readonly name: string;
  readonly description: string;
  readonly rules: SecurityPolicyRules;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SecurityPolicyRules {
  readonly blockedActions?: readonly string[];
  readonly blockedPatterns?: readonly string[];
  readonly allowedActions?: readonly string[];
}

export interface RegisterSecurityPolicyInput {
  readonly name: string;
  readonly description?: string;
  readonly rules?: SecurityPolicyRules;
  readonly status?: "active" | "inactive";
}

export interface UpdateSecurityPolicyInput {
  readonly policyId: string;
  readonly name?: string;
  readonly description?: string;
  readonly rules?: SecurityPolicyRules;
  readonly status?: "active" | "inactive";
}

export interface ValidateAgentActionInput {
  readonly actionName: string;
  readonly agentId?: string;
  readonly payload?: unknown;
  readonly policyId?: string;
}

export interface ValidateAgentActionResult {
  readonly auditId: string;
  readonly actionName: string;
  readonly allowed: boolean;
  readonly reason: string;
  readonly policyId: string | null;
  readonly mock: boolean;
}

export interface SecurityAuditEntry {
  readonly auditId: string;
  readonly actionName: string;
  readonly agentId: string | null;
  readonly allowed: boolean;
  readonly reason: string;
  readonly policyId: string | null;
  readonly input: unknown;
  readonly createdAt: string;
}

export interface ListSecurityPoliciesResult {
  readonly policies: readonly SecurityPolicy[];
  readonly total: number;
}

export interface GetSecurityAuditHistoryResult {
  readonly entries: readonly SecurityAuditEntry[];
  readonly total: number;
}

export interface DeleteSecurityPolicyResult {
  readonly policyId: string;
  readonly deleted: boolean;
}

export interface SecurityStatistics {
  readonly totalPolicies: number;
  readonly activePolicies: number;
  readonly totalChecks: number;
  readonly allowedChecks: number;
  readonly deniedChecks: number;
}

export function createSecurityPolicy(input: {
  policyId: string;
  name: string;
  description?: string;
  rules?: SecurityPolicyRules;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): SecurityPolicy {
  const now = new Date().toISOString();
  return Object.freeze({
    policyId: input.policyId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    rules: Object.freeze(normalizeSecurityPolicyRules(input.rules)),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function normalizeSecurityPolicyRules(rules?: SecurityPolicyRules): SecurityPolicyRules {
  return Object.freeze({
    blockedActions: Object.freeze([...(rules?.blockedActions ?? [])]),
    blockedPatterns: Object.freeze([...(rules?.blockedPatterns ?? [])]),
    allowedActions: Object.freeze([...(rules?.allowedActions ?? [])]),
  });
}

export function createSecurityAuditEntry(input: {
  auditId: string;
  actionName: string;
  agentId?: string | null;
  allowed: boolean;
  reason: string;
  policyId?: string | null;
  input: unknown;
  createdAt?: string;
}): SecurityAuditEntry {
  return Object.freeze({
    auditId: input.auditId,
    actionName: input.actionName.trim(),
    agentId: input.agentId ?? null,
    allowed: input.allowed,
    reason: input.reason,
    policyId: input.policyId ?? null,
    input: input.input,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}
