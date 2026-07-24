import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** Future integration point for capability profile export. Not wired yet. */
export interface ICapabilityProfileExportProvider {
  exportProfiles(capabilityProfiles: readonly CapabilityProfile[]): Promise<string>;
}
