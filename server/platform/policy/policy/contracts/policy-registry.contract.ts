import type { PolicyCategory, PolicyDescriptor } from "@server/platform/policy/policy/models";

/** Contract for policy metadata registration. */
export interface IPolicyRegistry {
  register(policy: PolicyDescriptor): PolicyDescriptor;
  get(policyId: string): PolicyDescriptor | undefined;
  list(category?: PolicyCategory): readonly PolicyDescriptor[];
}
