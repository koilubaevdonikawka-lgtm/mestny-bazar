import type {
  ComputeProfile,
  ComputeProfileRegistryStatistics,
  DeleteComputeProfileResult,
  FindComputeProfileByNameResult,
  ListComputeProfilesByCategoryResult,
  ListComputeProfilesResult,
  RegisterComputeProfileInput,
  UpdateComputeProfileInput,
} from "@server/application/ai-compute-profile-registry/models/compute-profile.model";
import type { AiComputeProfileRegistryService } from "@server/application/ai-compute-profile-registry/services/ai-compute-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterComputeProfileUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(input: RegisterComputeProfileInput): Promise<UseCaseResult<ComputeProfile>> {
    return this.computeProfileRegistry.registerComputeProfile(input).then(useCaseResult);
  }
}

export class GetComputeProfileUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(computeProfileId: string): Promise<UseCaseResult<ComputeProfile | null>> {
    return this.computeProfileRegistry.getComputeProfile(computeProfileId).then(useCaseResult);
  }
}

export class ListComputeProfilesUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListComputeProfilesResult>> {
    return this.computeProfileRegistry.listComputeProfiles().then(useCaseResult);
  }
}

export class UpdateComputeProfileUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(input: UpdateComputeProfileInput): Promise<UseCaseResult<ComputeProfile>> {
    return this.computeProfileRegistry.updateComputeProfile(input).then(useCaseResult);
  }
}

export class DeleteComputeProfileUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(computeProfileId: string): Promise<UseCaseResult<DeleteComputeProfileResult>> {
    return this.computeProfileRegistry.deleteComputeProfile(computeProfileId).then(useCaseResult);
  }
}

export class FindComputeProfileByNameUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindComputeProfileByNameResult>> {
    return this.computeProfileRegistry.findComputeProfileByName(name).then(useCaseResult);
  }
}

export class ListComputeProfilesByCategoryUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListComputeProfilesByCategoryResult>> {
    return this.computeProfileRegistry.listComputeProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetComputeProfileRegistryStatisticsUseCase {
  constructor(private readonly computeProfileRegistry: AiComputeProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ComputeProfileRegistryStatistics>> {
    return this.computeProfileRegistry.getComputeProfileRegistryStatistics().then(useCaseResult);
  }
}
