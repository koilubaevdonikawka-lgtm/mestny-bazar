import type { ISamplingPolicyEngine, SamplingPolicy } from "@server/platform/observability/observability/contracts";

const DEFAULT_POLICIES: readonly SamplingPolicy[] = Object.freeze([
  { id: "default-always", kind: "always", enabled: true },
  { id: "default-never", kind: "never", enabled: true },
  { id: "default-percentage", kind: "percentage", percentage: 50, enabled: true },
  { id: "default-adaptive", kind: "adaptive", enabled: true },
]);

/** Telemetry sampling policy engine (metadata only). */
export class SamplingPolicyEngine implements ISamplingPolicyEngine {
  private readonly policies = new Map<string, SamplingPolicy>();

  constructor() {
    for (const policy of DEFAULT_POLICIES) {
      this.policies.set(policy.id, Object.freeze({ ...policy }));
    }
  }

  registerPolicy(policy: SamplingPolicy): void {
    this.policies.set(policy.id, Object.freeze({ ...policy }));
  }

  shouldSample(policyId: string, traceId: string): boolean {
    const policy = this.policies.get(policyId.trim());
    if (!policy || !policy.enabled) {
      return false;
    }

    switch (policy.kind) {
      case "always":
        return true;
      case "never":
        return false;
      case "percentage":
        return this.hashTrace(traceId) < (policy.percentage ?? 100);
      case "adaptive":
        return traceId.length % 2 === 0;
      default:
        return true;
    }
  }

  listPolicies(): readonly SamplingPolicy[] {
    return Object.freeze([...this.policies.values()]);
  }

  private hashTrace(traceId: string): number {
    let hash = 0;
    for (const char of traceId) {
      hash = (hash + char.charCodeAt(0)) % 100;
    }
    return hash;
  }
}
