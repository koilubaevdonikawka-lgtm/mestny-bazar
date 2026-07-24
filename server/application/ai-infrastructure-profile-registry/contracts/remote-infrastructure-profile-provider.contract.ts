import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** Future integration point for external infrastructure profile providers. Not wired yet. */
export interface IRemoteInfrastructureProfileProvider {
  fetchRemote(infrastructureProfileId: string): Promise<InfrastructureProfile | null>;
  pushRemote(infrastructureProfile: InfrastructureProfile): Promise<void>;
}
