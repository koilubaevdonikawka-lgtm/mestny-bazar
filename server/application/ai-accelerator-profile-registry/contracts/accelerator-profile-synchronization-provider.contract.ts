import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** Future integration point for accelerator profile synchronization. Not wired yet. */
export interface IAcceleratorProfileSynchronizationProvider {
  synchronize(acceleratorProfiles: readonly AcceleratorProfile[]): Promise<void>;
}
