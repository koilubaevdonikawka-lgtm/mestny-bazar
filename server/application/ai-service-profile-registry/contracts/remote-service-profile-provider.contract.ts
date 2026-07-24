import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** Future integration point for external service profile providers. Not wired yet. */
export interface IRemoteServiceProfileProvider {
  fetchRemote(serviceProfileId: string): Promise<ServiceProfile | null>;
  pushRemote(serviceProfile: ServiceProfile): Promise<void>;
}
