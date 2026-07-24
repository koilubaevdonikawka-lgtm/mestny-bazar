import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** Future integration point for capability profile import. Not wired yet. */
export interface ICapabilityProfileImportProvider {
  importProfiles(source: string): Promise<readonly CapabilityProfile[]>;
}
