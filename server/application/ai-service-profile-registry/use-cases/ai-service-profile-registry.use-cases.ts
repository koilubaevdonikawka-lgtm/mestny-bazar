import type {
  DeleteServiceProfileResult,
  FindServiceProfileByNameResult,
  ServiceProfile,
  ServiceProfileRegistryStatistics,
  ListServiceProfilesByCategoryResult,
  ListServiceProfilesResult,
  RegisterServiceProfileInput,
  UpdateServiceProfileInput,
} from "@server/application/ai-service-profile-registry/models/service-profile.model";
import type { AiServiceProfileRegistryService } from "@server/application/ai-service-profile-registry/services/ai-service-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterServiceProfileUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(input: RegisterServiceProfileInput): Promise<UseCaseResult<ServiceProfile>> {
    return this.serviceProfileRegistry.registerServiceProfile(input).then(useCaseResult);
  }
}

export class GetServiceProfileUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(serviceProfileId: string): Promise<UseCaseResult<ServiceProfile | null>> {
    return this.serviceProfileRegistry.getServiceProfile(serviceProfileId).then(useCaseResult);
  }
}

export class ListServiceProfilesUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListServiceProfilesResult>> {
    return this.serviceProfileRegistry.listServiceProfiles().then(useCaseResult);
  }
}

export class UpdateServiceProfileUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(input: UpdateServiceProfileInput): Promise<UseCaseResult<ServiceProfile>> {
    return this.serviceProfileRegistry.updateServiceProfile(input).then(useCaseResult);
  }
}

export class DeleteServiceProfileUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(serviceProfileId: string): Promise<UseCaseResult<DeleteServiceProfileResult>> {
    return this.serviceProfileRegistry.deleteServiceProfile(serviceProfileId).then(useCaseResult);
  }
}

export class FindServiceProfileByNameUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindServiceProfileByNameResult>> {
    return this.serviceProfileRegistry.findServiceProfileByName(name).then(useCaseResult);
  }
}

export class ListServiceProfilesByCategoryUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListServiceProfilesByCategoryResult>> {
    return this.serviceProfileRegistry.listServiceProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetServiceProfileRegistryStatisticsUseCase {
  constructor(private readonly serviceProfileRegistry: AiServiceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ServiceProfileRegistryStatistics>> {
    return this.serviceProfileRegistry.getServiceProfileRegistryStatistics().then(useCaseResult);
  }
}
