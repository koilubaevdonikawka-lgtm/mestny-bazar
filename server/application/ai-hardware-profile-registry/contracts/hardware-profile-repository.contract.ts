import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

export interface IHardwareProfileRepository {
  save(hardwareProfile: HardwareProfile): Promise<void>;
  findById(hardwareProfileId: string): Promise<HardwareProfile | null>;
  findByName(name: string): Promise<HardwareProfile | null>;
  findByCategory(category: string): Promise<readonly HardwareProfile[]>;
  findAll(): Promise<readonly HardwareProfile[]>;
  delete(hardwareProfileId: string): Promise<boolean>;
}
