import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** Future integration point for external policy profile providers. Not wired yet. */
export interface IRemotePolicyProfileProvider {
  fetchRemote(policyProfileId: string): Promise<PolicyProfile | null>;
  pushRemote(policyProfile: PolicyProfile): Promise<void>;
}
