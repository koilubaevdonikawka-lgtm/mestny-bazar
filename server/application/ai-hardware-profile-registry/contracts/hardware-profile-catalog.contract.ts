import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

export interface IHardwareProfileCatalog {
  register(hardwareProfile: HardwareProfile): Promise<void>;
  remove(hardwareProfileId: string): Promise<void>;
  findById(hardwareProfileId: string): Promise<HardwareProfile | null>;
  findByName(name: string): Promise<HardwareProfile | null>;
  findByCategory(category: string): Promise<readonly HardwareProfile[]>;
  listAll(): Promise<readonly HardwareProfile[]>;
}
