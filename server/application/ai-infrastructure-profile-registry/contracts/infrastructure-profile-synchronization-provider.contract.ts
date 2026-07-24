import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** Future integration point for infrastructure profile synchronization. Not wired yet. */
export interface IInfrastructureProfileSynchronizationProvider {
  synchronize(infrastructureProfiles: readonly InfrastructureProfile[]): Promise<void>;
}
