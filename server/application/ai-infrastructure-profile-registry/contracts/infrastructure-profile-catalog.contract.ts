import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

export interface IInfrastructureProfileCatalog {
  register(infrastructureProfile: InfrastructureProfile): Promise<void>;
  remove(infrastructureProfileId: string): Promise<void>;
  findById(infrastructureProfileId: string): Promise<InfrastructureProfile | null>;
  findByName(name: string): Promise<InfrastructureProfile | null>;
  findByCategory(category: string): Promise<readonly InfrastructureProfile[]>;
  listAll(): Promise<readonly InfrastructureProfile[]>;
}
