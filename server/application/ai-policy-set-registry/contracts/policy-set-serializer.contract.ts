import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

export interface IPolicySetSerializer {
  serialize(policySet: PolicySet): Promise<string>;
  deserialize(serialized: string): Promise<PolicySet>;
}
