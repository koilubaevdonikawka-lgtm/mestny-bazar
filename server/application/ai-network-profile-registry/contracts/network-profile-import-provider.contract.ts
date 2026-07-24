import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** Future integration point for network profile import. Not wired yet. */
export interface INetworkProfileImportProvider {
  importProfiles(source: string): Promise<readonly NetworkProfile[]>;
}
