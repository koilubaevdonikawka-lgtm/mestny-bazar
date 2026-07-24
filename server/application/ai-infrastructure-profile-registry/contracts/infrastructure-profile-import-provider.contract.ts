import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** Future integration point for infrastructure profile import. Not wired yet. */
export interface IInfrastructureProfileImportProvider {
  importInfrastructureProfiles(source: string): Promise<readonly InfrastructureProfile[]>;
}
