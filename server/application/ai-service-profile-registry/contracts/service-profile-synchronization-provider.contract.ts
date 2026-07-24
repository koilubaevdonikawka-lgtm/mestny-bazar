import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** Future integration point for service profile synchronization. Not wired yet. */
export interface IServiceProfileSynchronizationProvider {
  synchronize(serviceProfiles: readonly ServiceProfile[]): Promise<void>;
}
