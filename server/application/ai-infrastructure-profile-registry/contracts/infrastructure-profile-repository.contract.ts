import type { InfrastructureProfile } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

export interface IInfrastructureProfileRepository {
  save(infrastructureProfile: InfrastructureProfile): Promise<void>;
  findById(infrastructureProfileId: string): Promise<InfrastructureProfile | null>;
  findByName(name: string): Promise<InfrastructureProfile | null>;
  findByCategory(category: string): Promise<readonly InfrastructureProfile[]>;
  findAll(): Promise<readonly InfrastructureProfile[]>;
  delete(infrastructureProfileId: string): Promise<boolean>;
}
