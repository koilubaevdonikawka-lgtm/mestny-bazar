import type {
  DeleteResourceProfileResult,
  FindResourceProfileByNameResult,
  ResourceProfile,
  ResourceProfileRegistryStatistics,
  ListResourceProfilesByCategoryResult,
  ListResourceProfilesResult,
  RegisterResourceProfileInput,
  UpdateResourceProfileInput,
} from "@server/application/ai-resource-profile-registry/models/resource-profile.model";
import type { AiResourceProfileRegistryService } from "@server/application/ai-resource-profile-registry/services/ai-resource-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterResourceProfileUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(input: RegisterResourceProfileInput): Promise<UseCaseResult<ResourceProfile>> {
    return this.resourceProfileRegistry.registerResourceProfile(input).then(useCaseResult);
  }
}

export class GetResourceProfileUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(resourceProfileId: string): Promise<UseCaseResult<ResourceProfile | null>> {
    return this.resourceProfileRegistry.getResourceProfile(resourceProfileId).then(useCaseResult);
  }
}

export class ListResourceProfilesUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListResourceProfilesResult>> {
    return this.resourceProfileRegistry.listResourceProfiles().then(useCaseResult);
  }
}

export class UpdateResourceProfileUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(input: UpdateResourceProfileInput): Promise<UseCaseResult<ResourceProfile>> {
    return this.resourceProfileRegistry.updateResourceProfile(input).then(useCaseResult);
  }
}

export class DeleteResourceProfileUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(resourceProfileId: string): Promise<UseCaseResult<DeleteResourceProfileResult>> {
    return this.resourceProfileRegistry.deleteResourceProfile(resourceProfileId).then(useCaseResult);
  }
}

export class FindResourceProfileByNameUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindResourceProfileByNameResult>> {
    return this.resourceProfileRegistry.findResourceProfileByName(name).then(useCaseResult);
  }
}

export class ListResourceProfilesByCategoryUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListResourceProfilesByCategoryResult>> {
    return this.resourceProfileRegistry.listResourceProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetResourceProfileRegistryStatisticsUseCase {
  constructor(private readonly resourceProfileRegistry: AiResourceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ResourceProfileRegistryStatistics>> {
    return this.resourceProfileRegistry.getResourceProfileRegistryStatistics().then(useCaseResult);
  }
}
