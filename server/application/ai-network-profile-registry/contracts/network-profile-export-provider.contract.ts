import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** Future integration point for network profile export. Not wired yet. */
export interface INetworkProfileExportProvider {
  exportProfiles(networkProfiles: readonly NetworkProfile[]): Promise<string>;
}
