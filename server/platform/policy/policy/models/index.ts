export {
  type PolicyCategory,
  type PolicyCheckKind,
  type PolicyDescriptor,
  createPolicyDescriptor,
} from "./policy-descriptor.model";
export {
  type PolicyEvaluation,
  createPolicyEvaluation,
} from "./policy-evaluation.model";
export {
  type PolicyEnforcementAction,
  type PolicyDecision,
  createPolicyDecision,
} from "./policy-decision.model";
export {
  type RuleKind,
  type RuleDescriptor,
  createRuleDescriptor,
} from "./rule-descriptor.model";
export {
  type PolicyExceptionKind,
  type PolicyException,
  createPolicyException,
} from "./policy-exception.model";

export type PolicyScope =
  | "platform"
  | "provider"
  | "sdk"
  | "gateway"
  | "runtime"
  | "documentation";

export interface PolicyScopeContext {
  readonly scope: PolicyScope;
  readonly identifiers: readonly string[];
  readonly resolvedAt: string;
}

export function createPolicyScopeContext(input: {
  scope: PolicyScope;
  identifiers: readonly string[];
}): PolicyScopeContext {
  return Object.freeze({
    scope: input.scope,
    identifiers: Object.freeze([...input.identifiers]),
    resolvedAt: new Date().toISOString(),
  });
}

export interface PolicyReport {
  readonly id: string;
  readonly generatedAt: string;
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly evaluations: readonly PolicyEvaluation[];
}

export function createPolicyReport(input: {
  id?: string;
  evaluations: readonly PolicyEvaluation[];
}): PolicyReport {
  const passed = input.evaluations.filter((evaluation) => evaluation.passed).length;
  return Object.freeze({
    id: input.id ?? `policy-report-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    total: input.evaluations.length,
    passed,
    failed: input.evaluations.length - passed,
    evaluations: Object.freeze([...input.evaluations]),
  });
}
