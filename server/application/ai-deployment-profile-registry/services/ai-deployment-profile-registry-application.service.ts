import type {
  RegisterDeploymentProfileInput,
  UpdateDeploymentProfileInput,
} from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";
import {
  DeleteDeploymentProfileUseCase,
  FindDeploymentProfileByNameUseCase,
  GetDeploymentProfileRegistryStatisticsUseCase,
  GetDeploymentProfileUseCase,
  ListDeploymentProfilesByCategoryUseCase,
  ListDeploymentProfilesUseCase,
  RegisterDeploymentProfileUseCase,
  UpdateDeploymentProfileUseCase,
} from "@server/application/ai-deployment-profile-registry/use-cases/ai-deployment-profile-registry.use-cases";

/** Application facade for AI Deployment Profile Registry scenario. */
export class AiDeploymentProfileRegistryApplicationService {
  constructor(
    private readonly registerDeploymentProfileUseCase: RegisterDeploymentProfileUseCase,
    private readonly getDeploymentProfileUseCase: GetDeploymentProfileUseCase,
    private readonly listDeploymentProfilesUseCase: ListDeploymentProfilesUseCase,
    private readonly updateDeploymentProfileUseCase: UpdateDeploymentProfileUseCase,
    private readonly deleteDeploymentProfileUseCase: DeleteDeploymentProfileUseCase,
    private readonly findDeploymentProfileByNameUseCase: FindDeploymentProfileByNameUseCase,
    private readonly listDeploymentProfilesByCategoryUseCase: ListDeploymentProfilesByCategoryUseCase,
    private readonly getDeploymentProfileRegistryStatisticsUseCase: GetDeploymentProfileRegistryStatisticsUseCase,
  ) {}

  registerDeploymentProfile(input: RegisterDeploymentProfileInput) {
    return this.registerDeploymentProfileUseCase.execute(input);
  }

  getDeploymentProfile(deploymentProfileId: string) {
    return this.getDeploymentProfileUseCase.execute(deploymentProfileId);
  }

  listDeploymentProfiles() {
    return this.listDeploymentProfilesUseCase.execute();
  }

  updateDeploymentProfile(input: UpdateDeploymentProfileInput) {
    return this.updateDeploymentProfileUseCase.execute(input);
  }

  deleteDeploymentProfile(deploymentProfileId: string) {
    return this.deleteDeploymentProfileUseCase.execute(deploymentProfileId);
  }

  findDeploymentProfileByName(name: string) {
    return this.findDeploymentProfileByNameUseCase.execute(name);
  }

  listDeploymentProfilesByCategory(category: string) {
    return this.listDeploymentProfilesByCategoryUseCase.execute(category);
  }

  getDeploymentProfileRegistryStatistics() {
    return this.getDeploymentProfileRegistryStatisticsUseCase.execute();
  }
}
