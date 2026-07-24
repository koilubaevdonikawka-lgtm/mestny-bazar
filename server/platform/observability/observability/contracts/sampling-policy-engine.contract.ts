import type { SamplingPolicyKind } from "@server/platform/observability/observability/models";

export interface SamplingPolicy {
  readonly id: string;
  readonly kind: SamplingPolicyKind;
  readonly percentage?: number;
  readonly enabled: boolean;
}

/** Contract for telemetry sampling policy metadata. */
export interface ISamplingPolicyEngine {
  registerPolicy(policy: SamplingPolicy): void;
  shouldSample(policyId: string, traceId: string): boolean;
  listPolicies(): readonly SamplingPolicy[];
}
