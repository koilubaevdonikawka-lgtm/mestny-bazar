import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

export interface IPolicyProfileSerializer {
  serialize(policyProfile: PolicyProfile): Promise<string>;
  deserialize(serialized: string): Promise<PolicyProfile>;
}
