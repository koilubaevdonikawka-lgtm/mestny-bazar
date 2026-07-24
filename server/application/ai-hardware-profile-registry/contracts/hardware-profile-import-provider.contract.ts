import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** Future integration point for hardware profile import. Not wired yet. */
export interface IHardwareProfileImportProvider {
  importHardwareProfiles(source: string): Promise<readonly HardwareProfile[]>;
}
