import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** Future integration point for compute profile import. Not wired yet. */
export interface IComputeProfileImportProvider {
  importComputeProfiles(source: string): Promise<readonly ComputeProfile[]>;
}
