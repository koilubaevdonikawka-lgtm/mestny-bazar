import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** Future integration point for accelerator profile export. Not wired yet. */
export interface IAcceleratorProfileExportProvider {
  exportProfiles(acceleratorProfiles: readonly AcceleratorProfile[]): Promise<string>;
}
