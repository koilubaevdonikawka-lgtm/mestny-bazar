import type {
  DeleteReliabilityProfileResult,
  FindReliabilityProfileByNameResult,
  ReliabilityProfile,
  ReliabilityProfileRegistryStatistics,
  ListReliabilityProfilesByCategoryResult,
  ListReliabilityProfilesResult,
  RegisterReliabilityProfileInput,
  UpdateReliabilityProfileInput,
} from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";
import type { AiReliabilityProfileRegistryService } from "@server/application/ai-reliability-profile-registry/services/ai-reliability-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterReliabilityProfileUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(input: RegisterReliabilityProfileInput): Promise<UseCaseResult<ReliabilityProfile>> {
    return this.reliabilityProfileRegistry.registerReliabilityProfile(input).then(useCaseResult);
  }
}

export class GetReliabilityProfileUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(reliabilityProfileId: string): Promise<UseCaseResult<ReliabilityProfile | null>> {
    return this.reliabilityProfileRegistry.getReliabilityProfile(reliabilityProfileId).then(useCaseResult);
  }
}

export class ListReliabilityProfilesUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListReliabilityProfilesResult>> {
    return this.reliabilityProfileRegistry.listReliabilityProfiles().then(useCaseResult);
  }
}

export class UpdateReliabilityProfileUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(input: UpdateReliabilityProfileInput): Promise<UseCaseResult<ReliabilityProfile>> {
    return this.reliabilityProfileRegistry.updateReliabilityProfile(input).then(useCaseResult);
  }
}

export class DeleteReliabilityProfileUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(reliabilityProfileId: string): Promise<UseCaseResult<DeleteReliabilityProfileResult>> {
    return this.reliabilityProfileRegistry.deleteReliabilityProfile(reliabilityProfileId).then(useCaseResult);
  }
}

export class FindReliabilityProfileByNameUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindReliabilityProfileByNameResult>> {
    return this.reliabilityProfileRegistry.findReliabilityProfileByName(name).then(useCaseResult);
  }
}

export class ListReliabilityProfilesByCategoryUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListReliabilityProfilesByCategoryResult>> {
    return this.reliabilityProfileRegistry.listReliabilityProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetReliabilityProfileRegistryStatisticsUseCase {
  constructor(private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ReliabilityProfileRegistryStatistics>> {
    return this.reliabilityProfileRegistry.getReliabilityProfileRegistryStatistics().then(useCaseResult);
  }
}
