import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

export interface IAcceleratorProfileRepository {
  save(acceleratorProfile: AcceleratorProfile): Promise<void>;
  findById(acceleratorProfileId: string): Promise<AcceleratorProfile | null>;
  findByName(name: string): Promise<AcceleratorProfile | null>;
  findByCategory(category: string): Promise<readonly AcceleratorProfile[]>;
  findAll(): Promise<readonly AcceleratorProfile[]>;
  delete(acceleratorProfileId: string): Promise<boolean>;
}
