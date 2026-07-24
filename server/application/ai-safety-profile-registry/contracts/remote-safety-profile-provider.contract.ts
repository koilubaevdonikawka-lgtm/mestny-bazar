import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** Future integration point for external safety profile providers. Not wired yet. */
export interface IRemoteSafetyProfileProvider {
  fetchRemote(safetyProfileId: string): Promise<SafetyProfile | null>;
  pushRemote(safetyProfile: SafetyProfile): Promise<void>;
}
