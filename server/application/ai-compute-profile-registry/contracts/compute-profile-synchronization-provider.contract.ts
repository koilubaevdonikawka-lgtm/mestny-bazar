import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** Future integration point for compute profile synchronization. Not wired yet. */
export interface IComputeProfileSynchronizationProvider {
  synchronize(computeProfiles: readonly ComputeProfile[]): Promise<void>;
}
