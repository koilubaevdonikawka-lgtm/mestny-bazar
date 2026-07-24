import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** Future integration point for infrastructure profile export. Not wired yet. */
export interface IInfrastructureProfileExportProvider {
  exportInfrastructureProfiles(
    infrastructureProfiles: readonly InfrastructureProfile[],
  ): Promise<string>;
}
