import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** Future integration point for transparency profile synchronization. Not wired yet. */
export interface ITransparencyProfileSynchronizationProvider {
  synchronize(transparencyProfiles: readonly TransparencyProfile[]): Promise<void>;
}
