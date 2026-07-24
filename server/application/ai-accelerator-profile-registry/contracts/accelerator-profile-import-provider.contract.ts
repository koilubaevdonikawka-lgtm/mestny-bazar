import type { AcceleratorProfile } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** Future integration point for accelerator profile import. Not wired yet. */
export interface IAcceleratorProfileImportProvider {
  importProfiles(source: string): Promise<readonly AcceleratorProfile[]>;
}
