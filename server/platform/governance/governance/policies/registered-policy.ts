import type { IPolicy } from "@server/platform/governance/governance/contracts";
import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";

/** Policy bound to a specific evaluator implementation. */
export class RegisteredPolicy implements IPolicy {
  constructor(
    readonly descriptor: PolicyDescriptor,
    private readonly evaluator: IPolicyEvaluator,
  ) {}

  evaluate(): Promise<PolicyResult> | PolicyResult {
    return this.evaluator.evaluate(this.descriptor);
  }
}
