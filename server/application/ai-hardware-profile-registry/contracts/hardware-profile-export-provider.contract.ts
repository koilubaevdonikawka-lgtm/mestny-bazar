import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** Future integration point for hardware profile export. Not wired yet. */
export interface IHardwareProfileExportProvider {
  exportHardwareProfiles(hardwareProfiles: readonly HardwareProfile[]): Promise<string>;
}
