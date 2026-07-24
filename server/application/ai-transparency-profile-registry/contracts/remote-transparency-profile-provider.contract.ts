import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** Future integration point for external transparency profile providers. Not wired yet. */
export interface IRemoteTransparencyProfileProvider {
  fetchRemote(transparencyProfileId: string): Promise<TransparencyProfile | null>;
  pushRemote(transparencyProfile: TransparencyProfile): Promise<void>;
}
