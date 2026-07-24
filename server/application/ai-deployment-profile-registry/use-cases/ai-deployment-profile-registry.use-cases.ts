import type {
  DeleteDeploymentProfileResult,
  DeploymentProfile,
  DeploymentProfileRegistryStatistics,
  FindDeploymentProfileByNameResult,
  ListDeploymentProfilesByCategoryResult,
  ListDeploymentProfilesResult,
  RegisterDeploymentProfileInput,
  UpdateDeploymentProfileInput,
} from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";
import type { AiDeploymentProfileRegistryService } from "@server/application/ai-deployment-profile-registry/services/ai-deployment-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterDeploymentProfileUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(input: RegisterDeploymentProfileInput): Promise<UseCaseResult<DeploymentProfile>> {
    return this.deploymentProfileRegistry.registerDeploymentProfile(input).then(useCaseResult);
  }
}

export class GetDeploymentProfileUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(deploymentProfileId: string): Promise<UseCaseResult<DeploymentProfile | null>> {
    return this.deploymentProfileRegistry.getDeploymentProfile(deploymentProfileId).then(useCaseResult);
  }
}

export class ListDeploymentProfilesUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListDeploymentProfilesResult>> {
    return this.deploymentProfileRegistry.listDeploymentProfiles().then(useCaseResult);
  }
}

export class UpdateDeploymentProfileUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(input: UpdateDeploymentProfileInput): Promise<UseCaseResult<DeploymentProfile>> {
    return this.deploymentProfileRegistry.updateDeploymentProfile(input).then(useCaseResult);
  }
}

export class DeleteDeploymentProfileUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(deploymentProfileId: string): Promise<UseCaseResult<DeleteDeploymentProfileResult>> {
    return this.deploymentProfileRegistry.deleteDeploymentProfile(deploymentProfileId).then(useCaseResult);
  }
}

export class FindDeploymentProfileByNameUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindDeploymentProfileByNameResult>> {
    return this.deploymentProfileRegistry.findDeploymentProfileByName(name).then(useCaseResult);
  }
}

export class ListDeploymentProfilesByCategoryUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListDeploymentProfilesByCategoryResult>> {
    return this.deploymentProfileRegistry.listDeploymentProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetDeploymentProfileRegistryStatisticsUseCase {
  constructor(private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryService) {}

  execute(): Promise<UseCaseResult<DeploymentProfileRegistryStatistics>> {
    return this.deploymentProfileRegistry.getDeploymentProfileRegistryStatistics().then(useCaseResult);
  }
}
