import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** Future integration point for compute profile export. Not wired yet. */
export interface IComputeProfileExportProvider {
  exportComputeProfiles(computeProfiles: readonly ComputeProfile[]): Promise<string>;
}
