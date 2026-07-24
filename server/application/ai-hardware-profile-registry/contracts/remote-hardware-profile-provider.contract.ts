import type { HardwareProfile } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** Future integration point for external hardware profile providers. Not wired yet. */
export interface IRemoteHardwareProfileProvider {
  fetchRemote(hardwareProfileId: string): Promise<HardwareProfile | null>;
  pushRemote(hardwareProfile: HardwareProfile): Promise<void>;
}
