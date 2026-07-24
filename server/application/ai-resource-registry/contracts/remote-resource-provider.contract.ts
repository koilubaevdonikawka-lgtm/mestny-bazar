import type { Resource } from "@server/application/ai-resource-registry/models/resource.model";

/** Future integration point for external resource providers. Not wired yet. */
export interface IRemoteResourceProvider {
  fetchRemote(resourceId: string): Promise<Resource | null>;
  pushRemote(resource: Resource): Promise<void>;
}
