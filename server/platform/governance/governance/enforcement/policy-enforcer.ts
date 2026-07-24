import type { IPolicyEnforcer } from "@server/platform/governance/governance/contracts";
import type { PolicyViolation } from "@server/platform/governance/governance/models";
import { PolicySeverity } from "@server/platform/governance/governance/models";

/** Applies enforcement actions to collected policy violations. */
export class PolicyEnforcer implements IPolicyEnforcer {
  allow(): { action: "allow"; violations: readonly PolicyViolation[] } {
    return Object.freeze({ action: "allow", violations: Object.freeze([]) });
  }

  warn(violations: readonly PolicyViolation[]): { action: "warn"; violations: readonly PolicyViolation[] } {
    return Object.freeze({ action: "warn", violations: Object.freeze([...violations]) });
  }

  block(violations: readonly PolicyViolation[]): { action: "block"; violations: readonly PolicyViolation[] } {
    return Object.freeze({ action: "block", violations: Object.freeze([...violations]) });
  }

  collectViolations(
    results: readonly { readonly passed: boolean; readonly violations: readonly PolicyViolation[] }[],
  ): PolicyViolation[] {
    return results.flatMap((result) => (result.passed ? [] : [...result.violations]));
  }

  enforce(violations: readonly PolicyViolation[]): ReturnType<IPolicyEnforcer["allow"]> {
    if (violations.length === 0) {
      return this.allow();
    }

    const hasCritical = violations.some(
      (violation) =>
        violation.severity === PolicySeverity.Critical || violation.severity === PolicySeverity.Error,
    );
    if (hasCritical) {
      return this.block(violations);
    }
    return this.warn(violations);
  }
}
