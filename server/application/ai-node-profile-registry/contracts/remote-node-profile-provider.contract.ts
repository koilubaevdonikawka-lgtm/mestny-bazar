import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** Future integration point for external node profile providers. Not wired yet. */
export interface IRemoteNodeProfileProvider {
  fetchRemote(nodeProfileId: string): Promise<NodeProfile | null>;
  pushRemote(nodeProfile: NodeProfile): Promise<void>;
}
