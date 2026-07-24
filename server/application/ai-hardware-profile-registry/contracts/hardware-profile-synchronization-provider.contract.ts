import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** Future integration point for hardware profile synchronization. Not wired yet. */
export interface IHardwareProfileSynchronizationProvider {
  synchronize(hardwareProfiles: readonly HardwareProfile[]): Promise<void>;
}
