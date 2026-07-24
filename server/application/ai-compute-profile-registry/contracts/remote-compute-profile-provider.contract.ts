import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** Future integration point for external compute profile providers. Not wired yet. */
export interface IRemoteComputeProfileProvider {
  fetchRemote(computeProfileId: string): Promise<ComputeProfile | null>;
  pushRemote(computeProfile: ComputeProfile): Promise<void>;
}
