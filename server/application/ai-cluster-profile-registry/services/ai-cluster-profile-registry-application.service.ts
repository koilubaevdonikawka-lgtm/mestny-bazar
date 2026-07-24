import type {
  RegisterClusterProfileInput,
  UpdateClusterProfileInput,
} from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";
import {
  DeleteClusterProfileUseCase,
  FindClusterProfileByNameUseCase,
  GetClusterProfileRegistryStatisticsUseCase,
  GetClusterProfileUseCase,
  ListClusterProfilesByCategoryUseCase,
  ListClusterProfilesUseCase,
  RegisterClusterProfileUseCase,
  UpdateClusterProfileUseCase,
} from "@server/application/ai-cluster-profile-registry/use-cases/ai-cluster-profile-registry.use-cases";

/** Application facade for AI Cluster Profile Registry scenario. */
export class AiClusterProfileRegistryApplicationService {
  constructor(
    private readonly registerClusterProfileUseCase: RegisterClusterProfileUseCase,
    private readonly getClusterProfileUseCase: GetClusterProfileUseCase,
    private readonly listClusterProfilesUseCase: ListClusterProfilesUseCase,
    private readonly updateClusterProfileUseCase: UpdateClusterProfileUseCase,
    private readonly deleteClusterProfileUseCase: DeleteClusterProfileUseCase,
    private readonly findClusterProfileByNameUseCase: FindClusterProfileByNameUseCase,
    private readonly listClusterProfilesByCategoryUseCase: ListClusterProfilesByCategoryUseCase,
    private readonly getClusterProfileRegistryStatisticsUseCase: GetClusterProfileRegistryStatisticsUseCase,
  ) {}

  registerClusterProfile(input: RegisterClusterProfileInput) {
    return this.registerClusterProfileUseCase.execute(input);
  }

  getClusterProfile(clusterProfileId: string) {
    return this.getClusterProfileUseCase.execute(clusterProfileId);
  }

  listClusterProfiles() {
    return this.listClusterProfilesUseCase.execute();
  }

  updateClusterProfile(input: UpdateClusterProfileInput) {
    return this.updateClusterProfileUseCase.execute(input);
  }

  deleteClusterProfile(clusterProfileId: string) {
    return this.deleteClusterProfileUseCase.execute(clusterProfileId);
  }

  findClusterProfileByName(name: string) {
    return this.findClusterProfileByNameUseCase.execute(name);
  }

  listClusterProfilesByCategory(category: string) {
    return this.listClusterProfilesByCategoryUseCase.execute(category);
  }

  getClusterProfileRegistryStatistics() {
    return this.getClusterProfileRegistryStatisticsUseCase.execute();
  }
}
