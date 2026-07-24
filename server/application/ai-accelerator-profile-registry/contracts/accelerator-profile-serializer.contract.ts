import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

export interface IAcceleratorProfileSerializer {
  serialize(acceleratorProfile: AcceleratorProfile): Promise<string>;
  deserialize(serialized: string): Promise<AcceleratorProfile>;
}
