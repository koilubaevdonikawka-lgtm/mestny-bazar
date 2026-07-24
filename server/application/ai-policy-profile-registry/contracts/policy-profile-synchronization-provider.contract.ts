import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** Future integration point for policy profile synchronization. Not wired yet. */
export interface IPolicyProfileSynchronizationProvider {
  synchronize(policyProfiles: readonly PolicyProfile[]): Promise<void>;
}
