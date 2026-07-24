import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** Future integration point for external trust profile providers. Not wired yet. */
export interface IRemoteTrustProfileProvider {
  fetchRemote(trustProfileId: string): Promise<TrustProfile | null>;
  pushRemote(trustProfile: TrustProfile): Promise<void>;
}
