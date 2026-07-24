import type {
  DeleteEnvironmentProfileResult,
  EnvironmentProfile,
  EnvironmentProfileRegistryStatistics,
  FindEnvironmentProfileByNameResult,
  ListEnvironmentProfilesByCategoryResult,
  ListEnvironmentProfilesResult,
  RegisterEnvironmentProfileInput,
  UpdateEnvironmentProfileInput,
} from "@server/application/ai-environment-profile-registry/models/environment-profile.model";
import type { AiEnvironmentProfileRegistryService } from "@server/application/ai-environment-profile-registry/services/ai-environment-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterEnvironmentProfileUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(input: RegisterEnvironmentProfileInput): Promise<UseCaseResult<EnvironmentProfile>> {
    return this.environmentProfileRegistry.registerEnvironmentProfile(input).then(useCaseResult);
  }
}

export class GetEnvironmentProfileUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(environmentProfileId: string): Promise<UseCaseResult<EnvironmentProfile | null>> {
    return this.environmentProfileRegistry.getEnvironmentProfile(environmentProfileId).then(useCaseResult);
  }
}

export class ListEnvironmentProfilesUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListEnvironmentProfilesResult>> {
    return this.environmentProfileRegistry.listEnvironmentProfiles().then(useCaseResult);
  }
}

export class UpdateEnvironmentProfileUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(input: UpdateEnvironmentProfileInput): Promise<UseCaseResult<EnvironmentProfile>> {
    return this.environmentProfileRegistry.updateEnvironmentProfile(input).then(useCaseResult);
  }
}

export class DeleteEnvironmentProfileUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(environmentProfileId: string): Promise<UseCaseResult<DeleteEnvironmentProfileResult>> {
    return this.environmentProfileRegistry.deleteEnvironmentProfile(environmentProfileId).then(useCaseResult);
  }
}

export class FindEnvironmentProfileByNameUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindEnvironmentProfileByNameResult>> {
    return this.environmentProfileRegistry.findEnvironmentProfileByName(name).then(useCaseResult);
  }
}

export class ListEnvironmentProfilesByCategoryUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListEnvironmentProfilesByCategoryResult>> {
    return this.environmentProfileRegistry.listEnvironmentProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetEnvironmentProfileRegistryStatisticsUseCase {
  constructor(private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryService) {}

  execute(): Promise<UseCaseResult<EnvironmentProfileRegistryStatistics>> {
    return this.environmentProfileRegistry.getEnvironmentProfileRegistryStatistics().then(useCaseResult);
  }
}
