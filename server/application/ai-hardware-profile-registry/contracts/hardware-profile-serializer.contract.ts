import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

export interface IHardwareProfileSerializer {
  serialize(hardwareProfile: HardwareProfile): Promise<string>;
  deserialize(serialized: string): Promise<HardwareProfile>;
}
