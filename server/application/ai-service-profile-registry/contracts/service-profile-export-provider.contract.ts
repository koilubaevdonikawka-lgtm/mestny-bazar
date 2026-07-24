import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** Future integration point for service profile export. Not wired yet. */
export interface IServiceProfileExportProvider {
  exportProfiles(serviceProfiles: readonly ServiceProfile[]): Promise<string>;
}
