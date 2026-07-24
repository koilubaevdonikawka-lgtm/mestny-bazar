import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

export interface IAcceleratorProfileCatalog {
  register(acceleratorProfile: AcceleratorProfile): Promise<void>;
  remove(acceleratorProfileId: string): Promise<void>;
  findById(acceleratorProfileId: string): Promise<AcceleratorProfile | null>;
  findByName(name: string): Promise<AcceleratorProfile | null>;
  findByCategory(category: string): Promise<readonly AcceleratorProfile[]>;
  listAll(): Promise<readonly AcceleratorProfile[]>;
}
