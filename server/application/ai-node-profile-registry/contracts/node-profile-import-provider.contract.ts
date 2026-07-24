import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** Future integration point for node profile import. Not wired yet. */
export interface INodeProfileImportProvider {
  importProfiles(source: string): Promise<readonly NodeProfile[]>;
}
