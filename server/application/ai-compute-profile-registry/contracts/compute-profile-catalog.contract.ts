import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

export interface IComputeProfileCatalog {
  register(computeProfile: ComputeProfile): Promise<void>;
  remove(computeProfileId: string): Promise<void>;
  findById(computeProfileId: string): Promise<ComputeProfile | null>;
  findByName(name: string): Promise<ComputeProfile | null>;
  findByCategory(category: string): Promise<readonly ComputeProfile[]>;
  listAll(): Promise<readonly ComputeProfile[]>;
}
