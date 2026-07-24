import type { ComputeProfile } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

export interface IComputeProfileRepository {
  save(computeProfile: ComputeProfile): Promise<void>;
  findById(computeProfileId: string): Promise<ComputeProfile | null>;
  findByName(name: string): Promise<ComputeProfile | null>;
  findByCategory(category: string): Promise<readonly ComputeProfile[]>;
  findAll(): Promise<readonly ComputeProfile[]>;
  delete(computeProfileId: string): Promise<boolean>;
}
