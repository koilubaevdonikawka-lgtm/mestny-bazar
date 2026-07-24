import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

export interface IInfrastructureProfileSerializer {
  serialize(infrastructureProfile: InfrastructureProfile): Promise<string>;
  deserialize(serialized: string): Promise<InfrastructureProfile>;
}
