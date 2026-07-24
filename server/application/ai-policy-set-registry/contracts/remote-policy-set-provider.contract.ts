import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** Future integration point for external policy set providers. Not wired yet. */
export interface IRemotePolicySetProvider {
  fetchRemote(policySetId: string): Promise<PolicySet | null>;
  pushRemote(policySet: PolicySet): Promise<void>;
}
