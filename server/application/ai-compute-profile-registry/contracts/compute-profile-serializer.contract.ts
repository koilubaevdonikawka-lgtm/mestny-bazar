import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

export interface IComputeProfileSerializer {
  serialize(computeProfile: ComputeProfile): Promise<string>;
  deserialize(serialized: string): Promise<ComputeProfile>;
}
