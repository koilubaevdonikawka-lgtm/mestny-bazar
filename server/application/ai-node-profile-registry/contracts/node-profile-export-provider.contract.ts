import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** Future integration point for node profile export. Not wired yet. */
export interface INodeProfileExportProvider {
  exportProfiles(nodeProfiles: readonly NodeProfile[]): Promise<string>;
}
