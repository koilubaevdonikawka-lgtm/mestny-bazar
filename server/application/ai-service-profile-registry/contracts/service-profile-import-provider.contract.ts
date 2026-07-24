import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** Future integration point for service profile import. Not wired yet. */
export interface IServiceProfileImportProvider {
  importProfiles(source: string): Promise<readonly ServiceProfile[]>;
}
