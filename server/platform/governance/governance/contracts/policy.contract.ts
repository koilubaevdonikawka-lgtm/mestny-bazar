import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";

/** Contract for a governance policy definition. */
export interface IPolicy {
  readonly descriptor: PolicyDescriptor;
  evaluate(): Promise<PolicyResult> | PolicyResult;
}
