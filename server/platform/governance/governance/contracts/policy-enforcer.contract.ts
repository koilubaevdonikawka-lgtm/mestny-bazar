import type { PolicyViolation } from "@server/platform/governance/governance/models";

export type EnforcementAction = "allow" | "warn" | "block";

export interface EnforcementDecision {
  readonly action: EnforcementAction;
  readonly violations: readonly PolicyViolation[];
}

/** Contract for policy enforcement. */
export interface IPolicyEnforcer {
  allow(): EnforcementDecision;
  warn(violations: readonly PolicyViolation[]): EnforcementDecision;
  block(violations: readonly PolicyViolation[]): EnforcementDecision;
  collectViolations(results: readonly { readonly passed: boolean; readonly violations: readonly PolicyViolation[] }>): readonly PolicyViolation[];
  enforce(violations: readonly PolicyViolation[]): EnforcementDecision;
}
