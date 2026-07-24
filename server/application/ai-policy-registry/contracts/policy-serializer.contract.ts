import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

export interface IPolicySerializer {
  serialize(policy: Policy): Promise<string>;
  deserialize(serialized: string): Promise<Policy>;
}
