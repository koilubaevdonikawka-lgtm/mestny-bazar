import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** Future integration point for external accelerator profile providers. Not wired yet. */
export interface IRemoteAcceleratorProfileProvider {
  fetchRemote(acceleratorProfileId: string): Promise<AcceleratorProfile | null>;
  pushRemote(acceleratorProfile: AcceleratorProfile): Promise<void>;
}
