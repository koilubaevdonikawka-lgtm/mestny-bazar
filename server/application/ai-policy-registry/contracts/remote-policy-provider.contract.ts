import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

/** Future integration point for external policy providers. Not wired yet. */
export interface IRemotePolicyProvider {
  fetchRemote(policyId: string): Promise<Policy | null>;
  pushRemote(policy: Policy): Promise<void>;
}
