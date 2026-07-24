import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";

/** Contract for policy evaluators. */
export interface IPolicyEvaluator {
  readonly id: string;
  readonly supportedCategories: readonly string[];
  evaluate(descriptor: PolicyDescriptor): Promise<PolicyResult> | PolicyResult;
}
