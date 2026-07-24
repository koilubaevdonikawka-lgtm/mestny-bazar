import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** Future integration point for node profile synchronization. Not wired yet. */
export interface INodeProfileSynchronizationProvider {
  synchronize(nodeProfiles: readonly NodeProfile[]): Promise<void>;
}
